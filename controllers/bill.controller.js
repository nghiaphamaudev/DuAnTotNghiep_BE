import HistoryBill from '../models/historyBill.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import { StatusCodes } from 'http-status-codes';
import Order from '../models/order.model';
import { format } from 'date-fns';

export const createHistoryBill = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const { userId, idBill, statusBill } = req.body;
  const creator = currentUser.fullName;
  const role = currentUser.role;
  const historyBill = new HistoryBill({
    userId,
    idBill,
    create,
    creator,
    role,
    statusBill,
  });
  await historyBill.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật trạng thái đơn hàng thành công!',
  });
});

export const getHistoryBill = catchAsync(async (req, res, next) => {
  //   const idBill = req.body.bill;
  const data = await HistoryBill.find({ idBill: req.body.bill }).sort(
    'createdAt'
  );
  if (!data || data.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Không có lịch sử đơn hàng này',
      data,
    });
  }
  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Đã tìm thấy lịch sử đơn hàng!',
    data,
  });
});

export const getAllBillByUser = catchAsync(async (req, res, next) => {
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

export const getBilDetailByUser = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;

  // Tìm đơn hàng theo ID và populate các thông tin cần thiết
  const order = await Order.findById(orderId).populate({
    path: 'orderItems.productId',
    select: 'name coverImg variants status', // Chỉ lấy các trường cần thiết
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
        variantId: variant._id,
        sizeId: size._id,
        statusProduct: product.status, // Trạng thái sản phẩm
        statusVariant: variant.status, // Trạng thái hết hàng của biến thể
        statusSize: size.status, // Trạng thái hết hàng của size
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
      createdAt: order.createdAt,
      status: order.status,
      orderItems: orderDetails,
    },
  });
});
