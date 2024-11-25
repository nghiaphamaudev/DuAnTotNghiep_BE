import Product from '../models/product.model';
import Cart from '../models/cart.model';
import Order from '../models/order.model';
import HistoryBill from '../models/historyBill.model';
import HistoryTransaction from '../models/historyTransaction.model';
import dayjs from 'dayjs';
import axios from 'axios';
import { format } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import mongoose from 'mongoose';
import AppError from '../utils/appError.util';
import { checkAddressOrderSchema } from '../validator/user.validator';
import { uploadProductImages } from '../middlewares/uploadCloud.middleware';
import { createPaymentUrl } from '../services/payment.service';
import { sendMailServiceConfirmOrder } from '../services/email.service';
import { RollbackQuantityProduct } from '../utils/order.util';
import Voucher from '../models/voucher.model';

function calculateTotalPrice(items) {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

const applyVoucher = (voucher, totalPrice) => {
  if (voucher.discountType === 'percentage') {
    return totalPrice - (totalPrice * voucher.discountPercentage) / 100;
  }

  if (voucher.discountType === 'amount') {
    return Math.max(0, totalPrice - voucher.discountAmount);
  }

  return totalPrice; // Nếu không áp dụng voucher
};

function getLastName(fullName) {
  if (!fullName) return ''; // Trường hợp chuỗi rỗng hoặc undefined
  const parts = fullName.trim().split(' '); // Loại bỏ khoảng trắng thừa và tách chuỗi
  return parts[parts.length - 1]; // Lấy phần tử cuối cùng
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
    console.log('Cập nhật giỏ hàng thành công sau khi đặt hàng!');
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
  }
};

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
    } = bodyData;
    console.log(discountCode);

    // Kiểm tra thông tin địa chỉ
    const { error } = checkAddressOrderSchema.validate(
      { receiver, phoneNumber, address },
      { abortEarly: false }
    );

    if (error) {
      const messages = error.details.map((item) => item.message);
      return res.status(StatusCodes.BAD_REQUEST).json({ messages });
    }

    // Tính tổng giá trị đơn hàng ban đầu
    let totalPrice = calculateTotalPrice(orderItems);

    // Nếu có voucher, áp dụng giảm giá
    if (discountCode) {
      const voucher = await Voucher.findOne({ code: discountCode });

      // if (voucher.userIds.includes(userId)) {
      //   return next(
      //     new AppError(
      //       'Bạn đã sử dụng voucher này rồi',
      //       StatusCodes.BAD_REQUEST
      //     )
      //   );
      // }
      await Voucher.findOneAndUpdate(
        { code: discountCode },
        { $push: { userIds: userId }, $inc: { usedCount: 1, quantity: -1 } }
      );
    }

    // Tạo mã đơn hàng
    const code = `FS${dayjs().format('YYYYMMDDHHmmss')}`;

    RollbackQuantityProduct(orderItems, next);

    // Tạo đơn hàng
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
    });
    await order.save({ session });

    // Tạo lịch sử hóa đơn
    const historyBill = new HistoryBill({
      userId: userId,
      idBill: order.id,
      creator: req.user.fullName,
      role: req.user.role,
      statusBill: 'Chờ xác nhận',
      note: '',
    });
    await historyBill.save({ session });

    // Nếu thanh toán qua VNPAY, trả URL thanh toán
    if (paymentMethod === 'VNPAY') {
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

    // Cập nhật giỏ hàng sau khi tạo đơn hàng
    await updateCartAfterOrder(userId, orderItems);

    await session.commitTransaction(); // Commit transaction
    session.endSession();

    return res.status(200).json({
      message: 'Thành công',
      data: order,
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback nếu có lỗi
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
    select: 'name coverImg variants ',
  });

  // Kiểm tra nếu không tìm thấy đơn hàng
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  // Xử lý dữ liệu từng sản phẩm trong orderItems
  const orderDetails = await Promise.all(
    order.orderItems.map(async (item) => {
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
        image: variant.images[0],
        size: size.nameSize,
        price: size.price,
        quantity: item.quantity,
        totalItemPrice: size.price * item.quantity,
      };
    })
  );

  // Tính tổng giá tiền cho đơn hàng (có thể đã được lưu nhưng tính lại để đảm bảo)
  const totalOrderPrice = orderDetails.reduce(
    (acc, item) => acc + item.totalItemPrice,
    0
  );

  //trả lại lịch sử đơn hàng
  const historyBills = await HistoryBill.find({ idBill: orderId });
  const formattedHistoryBills = historyBills.map((bill) => ({
    createdAt: format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    creator: bill.creator,
    role: bill.role,
    status: bill.statusBill,
    note: bill.note,
  }));

  // trả lại thông tin đơn hàng

  const orderInfor = {
    orderId: order._id,
    code: order.code,
    creator: req.user.fullName,
    address: order.address,
    paymentMethod: order.paymentMethod,
    phoneNumber: order.phoneNumber,
    status: order.status,
    receiver: order.receiver,
  };

  // trả lại lịch sử thanh toán

  const historyTransaction = await HistoryTransaction.findOne({
    idBill: orderId,
  });

  console.log(historyTransaction);

  const formattedHistoryTransaction = {
    totalPrice: historyTransaction.totalMoney,
    type: historyTransaction.type,
    createdAt: format(
      new Date(historyTransaction.createdAt),
      'dd/MM/yyyy HH:mm:ss'
    ),
  };

  res.status(200).json({
    status: true,
    message: 'Lấy thành công.',
    data: {
      orderInfor: orderInfor,
      totalOrderPrice, // Tổng giá tiền của đơn hàng
      createdAt: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      orderItems: orderDetails,
      historyBill: formattedHistoryBills,
      historyTransaction: formattedHistoryTransaction,
    },
  });
});

export const updateStatusOrder = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const nameUser = getLastName(currentUser.fullName);
  const { idOrder, status, statusShip } = req.body;

  const id = new mongoose.Types.ObjectId(idOrder);
  let updateOrder = await Order.findById(id);

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

  if (status === 'Đã hủy' || status === 'Hoàn đơn') {
    try {
      // Rollback số lượng sản phẩm trong kho
      await RollbackQuantityProduct(updateOrder.orderItems, next, true);
    } catch (error) {
      return next(
        new AppError(
          'Không thể rollback số lượng sản phẩm.',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
  updateOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { status, statusShip } },
    { new: true }
  ).populate({
    path: 'orderItems.productId',
    select: 'name coverImg variants',
  });

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

  const totalOrderPrice = orderDetails.reduce(
    (acc, item) => acc + item.totalItemPrice,
    0
  );

  if (status === 'Hoàn thành') {
    const historyTransaction = new HistoryTransaction({
      idUser: req.user.id,
      idBill: id,
      totalMoney: totalOrderPrice,
      note: '',
      status: true,
    });
    await historyTransaction.save();
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

  res.status(200).json({
    status: true,
    message: 'Lấy chi tiết đơn hàng thành công.',
    data: {
      orderId: updateOrder._id,
      code: updateOrder.code,
      totalOrderPrice, // Tổng giá tiền của đơn hàng
      createdAt: format(new Date(updateOrder.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      status: updateOrder.status,
      orderItems: orderDetails,
    },
  });
});
