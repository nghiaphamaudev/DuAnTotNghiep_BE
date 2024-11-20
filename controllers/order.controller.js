import Product from '../models/product.model';
import Cart from '../models/cart.model';
import Order from '../models/order.model';
import HistoryBill from '../models/historyBill.model';
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

function calculateTotalPrice(items) {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

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
  const userId = req.user.id; // Lấy ID người dùng từ token

  const { orderItems, ...bodyData } = req.body; // Tách sản phẩm đã chọn và dữ liệu còn lại
  const {
    receiver,
    phoneNumber,
    address,
    paymentMethod,
    discountCode,
    discountVoucher,
    shippingCost,
  } = bodyData;

  // Kiểm tra tính hợp lệ của địa chỉ
  const { error } = checkAddressOrderSchema.validate(
    { receiver, phoneNumber, address },
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  const code = `FS${dayjs().format('YYYYMMDDHHmmss')}`;
  const totalPrice = calculateTotalPrice(orderItems);

  const order = new Order({
    userId,
    code,
    orderItems,
    totalPrice,
    receiver,
    phoneNumber,
    address,
    paymentMethod,
    discountCode,
    shippingCost,
    discountVoucher,
  });

  await order.save();
  updateCartAfterOrder(userId, orderItems);

  const historyBill = new HistoryBill({
    userId: userId,
    idBill: order.id,
    creator: req.user.fullName,
    role: req.user.role,
    statusBill: 'Chờ xác nhận',
    note: '',
  });
  await historyBill.save();

  if (paymentMethod === 'VNPAY') {
    const urlPayment = createPaymentUrl(
      req,
      totalPrice,
      code,
      `Thanh toán đơn hàng ${code}`
    );
    return res.status(200).json({
      status: true,
      message: 'Đơn hàng được tạo thành công, chuyển hướng thanh toán',
      data: {
        paymentUrl: urlPayment,
      },
    });
  }

  return res.status(200).json({
    message: 'Thành công',
    data: order,
  });
});

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
  const orderId = req.params.orderId;

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
        images: variant.images[0],
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

  res.status(200).json({
    status: true,
    message: 'Lấy chi tiết đơn hàng thành công.',
    data: {
      orderId: order._id,
      code: order.code,
      totalOrderPrice, // Tổng giá tiền của đơn hàng
      createdAt: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      status: order.status,
      orderItems: orderDetails,
    },
  });
});

export const updateStatusOrder = catchAsync(async (req, res, next) => {
  const currentUser = req.user;

  const nameUser = getLastName(currentUser.fullName);
  const { idOrder, status, statusShip } = req.body;
  const id = new mongoose.Types.ObjectId(idOrder);
  if (!status) {
    return next(
      new AppError('Chuyển trạng thái thất bại', StatusCodes.BAD_REQUEST)
    );
  }

  let updateOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { status, statusShip } },
    { new: true }
  ).populate({
    path: 'orderItems.productId',
    select: 'name coverImg variants ',
  });

  if (!updateOrder) {
    return next(
      new AppError('Không tìm thấy đơn hàng.', StatusCodes.NOT_FOUND)
    );
  }

  //Lay chi tiet don hang
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

  // Tính tổng giá tiền cho đơn hàng (có thể đã được lưu nhưng tính lại để đảm bảo)
  const totalOrderPrice = orderDetails.reduce(
    (acc, item) => acc + item.totalItemPrice,
    0
  );

  if (status === 'Đã xác nhận') {
    const orderDate = format(
      new Date(updateOrder.createdAt),
      'dd/MM/yyyy HH:mm:ss'
    );
    const title = `Xác Nhận Đơn Hàng #${updateOrder.code} - Cảm ơn bạn đã mua sắm tại FShirt`;
    await sendMailServiceConfirmOrder(
      nameUser,
      updateOrder._id,
      orderDate,
      totalOrderPrice,
      orderDetails,
      currentUser.email,
      title
    );
  }

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
