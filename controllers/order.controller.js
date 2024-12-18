import Product from '../models/product.model';
import Cart from '../models/cart.model';
import Order from '../models/order.model';
import HistoryBill from '../models/historyBill.model';
import HistoryTransaction from '../models/historyTransaction.model';
import dayjs from 'dayjs';
import moment from 'moment';
import { format } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import mongoose from 'mongoose';
import AppError from '../utils/appError.util';
import { checkAddressOrderSchema } from '../validator/user.validator';
import {
  createPaymentUrl,
  refundTransaction,
} from '../services/payment.service';
import {
  sendMailDelivered,
  sendMailServiceConfirmOrder,
} from '../services/email.service';
import {
  RollbackInventoryOnCancel,
  RollbackQuantityProduct,
  rollbackVoucherOnCancel,
} from '../utils/order.util';
import Voucher from '../models/voucher.model';
import User from '../models/user.model';
import RoundRobin from '../models/roundRobin.model';
import Admin from '../models/admin.model';

function calculateTotalPrice(items) {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

const updateCartAfterOrder = async (userId, orderItems) => {
  try {
    await Cart.updateOne(
      { userId },
      {
        $pull: {
          items: {
            $or: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              sizeId: item.sizeId,
            })),
          },
        },
      }
    );
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
  }
};
async function assignOrderToAdmin() {
  // Bước 1: Lấy danh sách admin hoạt động và đảm bảo sắp xếp cố định
  const allAdmins = await Admin.find({ role: 'admin' })
    .select('_id active')
    .sort({ _id: 1 })
    .lean();

  console.log('Danh sách tất cả admin:', allAdmins);

  if (!allAdmins || allAdmins.length === 0) {
    throw new Error('Không tìm thấy admin nào để phân công.');
  }

  // Bước 2: Lấy trạng thái currentIndex từ MongoDB
  let state = await RoundRobin.findOne();

  // Nếu chưa tồn tại, khởi tạo state với currentIndex = 0
  if (!state) {
    state = await RoundRobin.create({ currentIndex: 0 });
  }

  let currentIndex = state.currentIndex;

  // Bước 3: Tìm admin hoạt động tiếp theo
  let attempts = 0;
  const totalAdmins = allAdmins.length;

  while (attempts < totalAdmins) {
    const admin = allAdmins[currentIndex];
    if (admin.active) {
      // Tìm thấy admin hoạt động
      state.currentIndex = (currentIndex + 1) % totalAdmins;
      await state.save();

      console.log(
        `Phân công cho admin: ${admin._id}, currentIndex: ${currentIndex}`
      );
      return admin._id; // Trả về _id của admin được phân công
    }

    // Chuyển đến admin tiếp theo
    currentIndex = (currentIndex + 1) % totalAdmins;
    attempts++;
  }

  // Nếu không tìm thấy admin nào hoạt động
  throw new Error('Không có admin nào hoạt động để phân công.');
}


export const createOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    const { orderItems, ...bodyData } = req.body;

    const {
      receiver,
      phoneNumber,
      address,
      paymentMethod,
      discountVoucher,
      discountCode,
      shippingCost,
      orderNote,
    } = bodyData;
    console.log(discountCode, discountVoucher);
    if (req.user.paymentRestriction === true && paymentMethod === 'COD')
      return next(
        new AppError(
          'Vui lòng chọn phương thức thanh toán khác!',
          StatusCodes.BAD_REQUEST
        )
      );
    const { error } = checkAddressOrderSchema.validate(
      { receiver, phoneNumber, address },
      { abortEarly: false }
    );

    if (error) {
      const messages = error.details.map((item) => item.message);
      return res.status(StatusCodes.BAD_REQUEST).json({ messages });
    }

    if (discountCode) {
      const voucher = await Voucher.findOne({ code: discountCode });

      if (!voucher) {
        return next(
          new AppError('Voucher này không tồn tại', StatusCodes.BAD_REQUEST)
        );
      }

      // Kiểm tra nếu voucher đã được người dùng sử dụng
      if (voucher.userIds.includes(userId)) {
        return next(
          new AppError(
            'Bạn đã sử dụng voucher này rồi',
            StatusCodes.BAD_REQUEST
          )
        );
      }

      // Kiểm tra số lượng voucher
      if (voucher.quantity <= 0) {
        return next(
          new AppError('Voucher đã hết số lượng', StatusCodes.BAD_REQUEST)
        );
      }

      if (voucher.status !== 'active') {
        return next(
          new AppError('Voucher này không khả dụng', StatusCodes.BAD_REQUEST)
        );
      }

      await Voucher.findOneAndUpdate(
        { code: discountCode },
        {
          $push: { userIds: userId },
          $inc: { usedCount: 1, quantity: -1 },
          $set: {
            status: voucher.quantity - 1 === 0 ? 'expired' : voucher.status,
          },
        }
      );
    }
    let totalPrice = calculateTotalPrice(orderItems);
    if (shippingCost) totalPrice += shippingCost;
    if (discountVoucher) totalPrice -= discountVoucher;
    const code = `FS${dayjs().format('YYYYMMDDHHmmss')}`;

    // Gọi RollbackQuantityProduct và đảm bảo sẽ dừng quá trình nếu có lỗi
    await RollbackQuantityProduct(orderItems, next);
    const assignedAdminId = await assignOrderToAdmin();

    const order = new Order({
      userId,
      code,
      orderItems,
      totalPrice,
      receiver,
      phoneNumber,
      address,
      paymentMethod,
      shippingCost,
      discountCode,
      discountVoucher,
      orderNote,
      assignedTo: assignedAdminId,
    });
    await order.save({ session });

    if (paymentMethod === 'VNPAY') {
      await updateCartAfterOrder(userId, orderItems);
      const urlPayment = createPaymentUrl(
        req,
        totalPrice,
        order.id,
        `Thanh toán đơn hàng ${code}`
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        status: true,
        message: 'Đơn hàng được tạo thành công, chuyển hướng thanh toán',
        data: { paymentUrl: urlPayment },
      });
    }
    const historyBill = new HistoryBill({
      userId: userId,
      idBill: order.id,
      creator: req.user.fullName,
      role: req.user.role,
      statusBill: 'Chờ xác nhận',

      note: '',
    });

    await historyBill.save({ session });

    await updateCartAfterOrder(userId, orderItems);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: true,
      message: 'Thành công',
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
});

// Hàm áp dụng voucher

export const getAllOrderByUserId = catchAsync(async (req, res, next) => {
  const idUser = req.user.id;
  const currentUser = req.user;

  // Lấy danh sách đơn hàng của người dùng
  const orders = await Order.find({ userId: idUser })
    .select('code totalPrice createdAt status') // Chỉ lấy các trường cần thiết
    .lean();

  // Kiểm tra nếu không có đơn hàng
  if (!orders || orders.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Không tìm thấy đơn hàng nào.',
    });
  }

  // Định dạng dữ liệu trả về
  const formattedOrders = orders.map((order) => ({
    code: order.code,
    id: order._id,
    totalPrice: order.totalPrice,
    creator: currentUser.fullName,
    createdAt: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss'), // Định dạng ngày
    status: order.status,
  }));

  // Trả về dữ liệu đã định dạng
  res.status(200).json({
    status: 'success',
    results: formattedOrders.length,
    data: { orders: formattedOrders },
  });
});

export const getOrderDetailByUser = catchAsync(async (req, res, next) => {
  const orderId = new mongoose.Types.ObjectId(req.params.orderId);

  // Tìm đơn hàng theo ID và populate các thông tin cần thiết
  const order = await Order.findById(orderId).populate({
    path: 'orderItems.productId',
    select: 'name coverImg variants',
  });
  if (!order)
    return next(new AppError('Order không tồn tại!', StatusCodes.NOT_FOUND));
  const userId = order.userId;
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );
  }
  // Kiểm tra nếu không tìm thấy đơn hàng
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  // Xử lý dữ liệu từng sản phẩm trong orderItems
  const orderDetails = await Promise.all(
    order.orderItems.map(async (item) => {
      const product = item.productId;

      if (!product) {
        throw new AppError('Sản phẩm không tồn tại trong đơn hàng.', 404);
      }

      // Tìm variant và size
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      // Kiểm tra nếu không tìm thấy variant
      if (!variant) {
        throw new AppError('Không tìm thấy variant cho sản phẩm.', 404);
      }
      const size = variant.sizes.find((s) => s._id.toString() === item.sizeId);

      // Kiểm tra nếu không tìm thấy size
      if (!size) {
        throw new AppError('Không tìm thấy size cho variant.', 404);
      }

      return {
        id: item._id,
        productId: product._id,
        name: product.name,
        color: variant.color,
        image: variant.images[0], // Bạn có thể thay đổi cách hiển thị ảnh nếu cần
        size: size.nameSize,
        price: item.price,
        quantity: item.quantity,
        totalItemPrice: item.price * item.quantity,
      };
    })
  );

  // Tính tổng giá tiền cho đơn hàng

  // Trả lại lịch sử đơn hàng

  const historyBills = await HistoryBill.find({ idBill: orderId });

  const formattedHistoryBills = historyBills.map((bill) => ({
    createdAt: format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    creator: bill.creator,
    role: bill.role,
    status: bill.statusBill,
    note: bill.note,
  }));

  // Trả lại thông tin đơn hàng
  const orderInfor = {
    orderId: order._id,
    code: order.code,
    creator: user.fullName,
    phoneNumberCreator: user.phoneNumber,
    address: order.address, //địa chỉ người nhận
    paymentMethod: order.paymentMethod,
    phoneNumber: order.phoneNumber, // sđt người nhận
    status: order.status,
    receiver: order.receiver,
    orderNote: order.orderNote, //tên người nhận
  };

  // Trả lại lịch sử thanh toán
  const historyTransaction = await HistoryTransaction.find({
    idBill: orderId,
  });

  let formattedHistoryTransaction;
  // Kiểm tra nếu không tìm thấy lịch sử thanh toán
  if (historyTransaction && historyTransaction.length > 0) {
    formattedHistoryTransaction = historyTransaction.map((transaction) => {
      const createdAt = transaction.transactionVnPayDate
        ? moment(transaction.transactionVnPayDate, 'YYYYMMDDHHmmss').format(
            'DD/MM/YYYY HH:mm:ss'
          )
        : format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm:ss');

      return {
        totalPrice: transaction.totalMoney,
        type: transaction.type,
        transactionVnPayId: transaction.transactionVnPayId,
        createdAt,
        ...(transaction.refundDetails && {
          refundDetails: transaction.refundDetails,
        }), // Thêm thông tin hoàn tiền nếu có
      };
    });
  }

  // Trả lại kết quả
  res.status(200).json({
    status: true,
    message: 'Lấy thành công.',
    data: {
      orderInfor,
      totalPrice: order.totalPrice,
      shippingCost: order.shippingCost,
      discountVoucher: order.discountVoucher,
      totalCost: order.totalCost, // Tổng giá tiền của đơn hàng
      createdAt: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      orderItems: orderDetails,
      historyBill: formattedHistoryBills,
      historyTransaction: formattedHistoryTransaction,
    },
  });
});

export const updateStatusOrderByUser = catchAsync(async (req, res, next) => {
  const { idOrder, status, statusShip } = req.body;

  const id = new mongoose.Types.ObjectId(idOrder);

  let updateOrder = await Order.findById(id);
  const historyTransaction = await HistoryTransaction.findOne({
    idBill: idOrder,
  });

  if (!status) {
    return next(
      new AppError('Chuyển trạng thái thất bại', StatusCodes.BAD_REQUEST)
    );
  }

  if (!updateOrder) {
    return next(
      new AppError('Không tìm thấy đơn hàng.', StatusCodes.NOT_FOUND)
    );
  }

  if (status === 'Đã hủy') {
    try {
      // Cập nhật trạng thái đơn hàng
      updateOrder.status = status;
      await updateOrder.save();

      // Rollback kho hàng
      await RollbackInventoryOnCancel(updateOrder.orderItems);

      // Rollback voucher nếu có
      if (updateOrder.discountVoucher) {
        await rollbackVoucherOnCancel(updateOrder.discountCode, next);
      }
      // Chỉ hoàn tiền nếu có lịch sử giao dịch
      if (historyTransaction) {
        const idBill = historyTransaction.idBill.toString();
        await refundTransaction(
          req,
          res,
          historyTransaction.idUser.toString(),
          historyTransaction.transactionVnPayId,
          historyTransaction.totalMoney,
          idBill,
          historyTransaction.transactionVnPayDate,
          'all'
        );
      }
    } catch (error) {
      // Xử lý lỗi rollback kho hàng hoặc voucher
      return next(
        new AppError(
          'Không thể rollback số lượng sản phẩm hoặc xử lý giao dịch.',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  updateOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { status, statusShip } },
    { new: true }
  )
    .populate({
      path: 'orderItems.productId',
      select: 'name coverImg variants',
    })
    .populate({
      path: 'userId',
      select: 'email fullName',
    });

  // const orderDate = format(
  //   new Date(updateOrder.createdAt),
  //   'dd/MM/yyyy HH:mm:ss'
  // );

  // const orderDetails = await Promise.all(
  //   updateOrder.orderItems.map(async (item) => {
  //     const product = item.productId;

  //     const variant = product.variants.find(
  //       (v) => v._id.toString() === item.variantId
  //     );

  //     const size = variant.sizes.find((s) => s._id.toString() === item.sizeId);

  //     return {
  //       id: item._id,
  //       productId: product._id,
  //       name: product.name,
  //       color: variant.color,
  //       images: variant.images[0],
  //       size: size.nameSize,
  //       price: size.price,
  //       quantity: item.quantity,
  //       totalItemPrice: size.price * item.quantity,
  //     };
  //   })
  // );

  if (status === 'Đã nhận được hàng') {
    const bulkOperations = updateOrder.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { saleCount: item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOperations);
    const recentOrders = await Order.find({
      userId: req.user.id,
      status: { $in: ['Đã giao hàng', 'Đã nhận được hàng'] },
    })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo
      .limit(2); // Lấy 2 đơn hàng gần nhất

    // Nếu có ít nhất 2 đơn liên tiếp với trạng thái hợp lệ
    if (recentOrders.length === 2) {
      const allDeliveredOrReceived = recentOrders.every((order) =>
        ['Đã giao hàng', 'Đã nhận được hàng'].includes(order.status)
      );
      if (allDeliveredOrReceived) {
        await User.findByIdAndUpdate(req.user.id, {
          paymentRestriction: false,
        });
      }
    }
  }

  const historyBill = new HistoryBill({
    userId: req.user.id,
    idBill: id,
    creator: req.user.fullName,
    role: req.user.role,
    statusBill: status,
    note: req.body.note || '',
  });

  await historyBill.save();
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Cập nhật trạng thái thành công!' });
  // Gọi res.status(200).json() ở cuối cùng để đảm bảo chỉ phản hồi một lần
});

export const updateStatusOrderByAdmin = catchAsync(async (req, res, next) => {
  const { idOrder, status, statusShip } = req.body;

  const id = new mongoose.Types.ObjectId(idOrder);

  let updateOrder = await Order.findById(id);
  const historyTransaction = await HistoryTransaction.findOne({
    idBill: idOrder,
  });
  const userId = updateOrder.userId;
  const user = await User.findById(updateOrder.userId);

  if (!status) {
    return next(
      new AppError('Chuyển trạng thái thất bại', StatusCodes.BAD_REQUEST)
    );
  }

  if (!updateOrder) {
    return next(
      new AppError('Không tìm thấy đơn hàng.', StatusCodes.NOT_FOUND)
    );
  }

  if (status === 'Đã hủy') {
    try {
      // Cập nhật trạng thái đơn hàng
      updateOrder.status = status;
      await updateOrder.save();

      // Rollback kho hàng
      await RollbackInventoryOnCancel(updateOrder.orderItems);

      // Rollback voucher nếu có
      if (updateOrder.discountVoucher) {
        await rollbackVoucherOnCancel(updateOrder.discountCode, next);
      }
      // Chỉ hoàn tiền nếu có lịch sử giao dịch
      if (historyTransaction) {
        const idBill = historyTransaction.idBill.toString();
        await refundTransaction(
          req,
          res,
          historyTransaction.idUser.toString(),
          historyTransaction.transactionVnPayId,
          historyTransaction.totalMoney,
          idBill,
          historyTransaction.transactionVnPayDate,
          'all'
        );
      }
    } catch (error) {
      // Xử lý lỗi rollback kho hàng hoặc voucher
      return next(
        new AppError(
          'Không thể rollback số lượng sản phẩm hoặc xử lý giao dịch.',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  if (status === 'Hoàn đơn') {
    try {
      // Cập nhật trạng thái đơn hàng
      updateOrder.status = status;
      updateOrder.statusShip = statusShip ? statusShip : false;
      await updateOrder.save();

      // Rollback kho hàng
      await RollbackInventoryOnCancel(updateOrder.orderItems);

      // Rollback voucher nếu có
      if (updateOrder.discountVoucher) {
        await rollbackVoucherOnCancel(updateOrder.discountCode, next);
      }
      // Chỉ hoàn tiền nếu có lịch sử giao dịch
      if (historyTransaction) {
        const idBill = historyTransaction.idBill.toString();
        let totalMoney;

        if (updateOrder.shippingCost === 0) {
          // đơn hàng freeship  khách ko nhận thì khách chịu ship 1 chiều
          totalMoney = historyTransaction.totalMoney - 30000;
        } else {
          // đơn hàng ko free ship khách ko nhận thì chịu 2 chiều
          totalMoney =
            historyTransaction.totalMoney - updateOrder.shippingCost * 2;
        }

        await refundTransaction(
          req,
          res,
          historyTransaction.idUser.toString(),
          historyTransaction.transactionVnPayId,
          totalMoney,
          idBill,
          historyTransaction.transactionVnPayDate,
          'part'
        );
      }
    } catch (error) {
      console.log(error);
      return next(
        new AppError(
          'Không thể rollback số lượng sản phẩm hoặc xử lý giao dịch.',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  updateOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { status, statusShip } },
    { new: true }
  )
    .populate({
      path: 'orderItems.productId',
      select: 'name coverImg variants',
    })
    .populate({
      path: 'userId',
      select: 'email fullName',
    });

  const orderDate = format(
    new Date(updateOrder.createdAt),
    'dd/MM/yyyy HH:mm:ss'
  );

  if (status === 'Đã giao hàng') {
    updateOrder.status = status;
    await updateOrder.save();

    const user = {
      id: updateOrder.userId.id,
      email: updateOrder.userId.email,
      fullName: updateOrder.userId.fullName,
    };

    await sendMailDelivered(
      user,
      'Đơn hàng đã được giao thành công!',
      updateOrder.code,
      orderDate,
      updateOrder.paymentMethod,
      updateOrder.totalPrice
    );

    if (!historyTransaction) {
      const historyTransactionCod = new HistoryTransaction({
        idUser: user.id,
        idBill: id,
        totalMoney: updateOrder.totalCost,
        note: '',
        status: true,
      });
      await historyTransactionCod.save();
    }

    // Kiểm tra lịch sử đơn hàng
    const recentOrders = await Order.find({
      userId: user.id,
      status: { $in: ['Đã giao hàng', 'Đã nhận được hàng'] },
    })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo
      .limit(2); // Lấy 2 đơn hàng gần nhất

    // Nếu có ít nhất 2 đơn liên tiếp với trạng thái hợp lệ
    if (recentOrders.length === 2) {
      const allDeliveredOrReceived = recentOrders.every((order) =>
        ['Đã giao hàng', 'Đã nhận được hàng'].includes(order.status)
      );
      if (allDeliveredOrReceived) {
        await User.findByIdAndUpdate(user.id, { paymentRestriction: false });
      }
    }
  }

  const orderDetails = await Promise.all(
    updateOrder.orderItems.map(async (item) => {
      const product = item.productId;

      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId
      );

      const size = variant.sizes.find((s) => s._id.toString() === item.sizeId);

      return {
        id: item._id,
        productId: product._id,
        name: product.name,
        color: variant.color,
        images: variant.images[0],
        size: size.nameSize,
        price: size.price,
        quantity: item.quantity,
        totalItemPrice: size.price * item.quantity,
      };
    })
  );

  if (status === 'Đã xác nhận') {
    const title = `Xác Nhận Đơn Hàng #${updateOrder.code} - Cảm ơn bạn đã mua sắm tại FShirt`;

    await updateOrder.save();
    await sendMailServiceConfirmOrder(
      updateOrder.code,
      orderDate,
      updateOrder.totalPrice,
      orderDetails,
      updateOrder.totalCost,
      updateOrder.discountVoucher,
      updateOrder.shippingCost,
      user.email,
      title,
      updateOrder.receiver,
      updateOrder.phoneNumber,
      updateOrder.address
    );
  }

  const historyBill = new HistoryBill({
    userId: userId,
    idBill: id,
    creator: req.admin.fullName,
    role: req.admin.role,
    statusBill: status,
    note: req.body.note || '',
  });
  await historyBill.save();
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Cập nhật trạng thái thành công!' });
  // Gọi res.status(200).json() ở cuối cùng để đảm bảo chỉ phản hồi một lần
});

export const getAllOrder = catchAsync(async (req, res, next) => {
  const orders = await Order.find();
  if (!orders) {
    res.status(StatusCodes.OK).json({
      status: true,
      message: 'Lấy thành công tất cả order',
      data: null,
    });
  }
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Lấy thành công tất cả order',
    data: orders,
  });
});

export const getAllOrderByRange = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Kiểm tra nếu không nhập startDate hoặc endDate
  if (!startDate || !endDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Vui lòng nhập khoảng thời gian hợp lệ.',
    });
  }

  // Chuyển đổi định dạng ngày
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Kiểm tra định dạng ngày
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không đúng định dạng ngày (YYYY-MM-DD).',
    });
  }

  // Thiết lập thời gian chính xác cho khoảng ngày
  start.setUTCHours(0, 0, 0, 0); // Đầu ngày của startDate
  end.setUTCHours(23, 59, 59, 999); // Cuối ngày của endDate

  // Lọc dữ liệu theo khoảng thời gian
  const filter = {
    createdAt: {
      $gte: start,
      $lte: end, // Bao gồm đến cuối ngày endDate
    },
  };

  const orders = await Order.find(filter);

  // Trả về kết quả
  if (!orders || orders.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Không có đơn hàng nào trong khoảng thời gian này.',
      data: [],
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Lấy thành công tất cả order.',
    data: orders,
  });
});
