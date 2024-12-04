// Đường dẫn import chính xác tùy vào cấu trúc dự án
import { StatusCodes } from 'http-status-codes';
import Order from '../models/order.model';
import Product from '../models/product.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';

//Top Customer
export const getTop5CustomersByDay = catchAsync(async (req, res, next) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày hôm nay
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày hôm nay
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc đơn hàng trong ngày hôm nay
        status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
    },
    {
      $group: {
        _id: '$userId', // Gộp theo ID người dùng (giả sử bạn có trường `userId` trong order)
        totalAmount: {
          $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] }, // Tổng giá trị đơn hàng
        },
      },
    },
    {
      $sort: { totalAmount: -1 }, // Sắp xếp theo tổng giá trị đơn hàng giảm dần
    },
    {
      $limit: 5, // Lấy top 5 khách hàng
    },
    {
      $lookup: {
        from: 'users', // Tên của collection User
        localField: '_id', // Trường userId trong Order sẽ được nối với trường _id của User
        foreignField: '_id', // Trường _id của User
        as: 'userInfo', // Đặt tên trường kết quả join là userInfo
      },
    },
    {
      $unwind: '$userInfo', // Tách mảng userInfo thành đối tượng để dễ truy cập
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        'userInfo.email': 1,
        'userInfo.fullName': 1,
        'userInfo.phoneNumber': 1,
      }, // Chỉ lấy các trường cần thiết
    },
  ]);

  // Trả kết quả về client
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getTop5CustomersByWeek = catchAsync(async (req, res, next) => {
  // Lấy ngày hiện tại
  const today = new Date();

  // Tính ngày đầu tuần (Thứ hai) của tuần hiện tại
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Chuyển sang thứ hai của tuần
  weekStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày đầu tuần

  // Tính ngày cuối tuần (Chủ nhật) của tuần hiện tại
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() - today.getDay() + 7); // Chuyển sang chủ nhật của tuần
  weekEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tuần

  // Lọc và nhóm đơn hàng theo tuần
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: weekStart, $lte: weekEnd }, // Lọc đơn hàng trong tuần hiện tại
        status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
    },
    {
      $group: {
        _id: '$userId', // Gộp theo ID người dùng
        totalAmount: {
          $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] }, // Tổng giá trị đơn hàng
        },
      },
    },
    {
      $sort: { totalAmount: -1 }, // Sắp xếp theo tổng giá trị đơn hàng giảm dần
    },
    {
      $limit: 5, // Lấy top 5 khách hàng
    },
    {
      $lookup: {
        from: 'users', // Tên của collection User
        localField: '_id', // Trường userId trong Order sẽ được nối với trường _id của User
        foreignField: '_id', // Trường _id của User
        as: 'userInfo', // Đặt tên trường kết quả join là userInfo
      },
    },
    {
      $unwind: '$userInfo', // Tách mảng userInfo thành đối tượng để dễ truy cập
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        'userInfo.email': 1,
        'userInfo.fullName': 1,
        'userInfo.phoneNumber': 1,
      }, // Chỉ lấy các trường cần thiết
    },
  ]);

  // Trả kết quả về client
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getTop5CustomersByMonth = catchAsync(async (req, res, next) => {
  const today = new Date();
  const currentMonth = today.getMonth(); // Lấy tháng hiện tại (từ 0 đến 11)
  const currentYear = today.getFullYear(); // Lấy năm hiện tại

  // Đặt thời gian bắt đầu của tháng
  const todayStart = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0); // Ngày đầu tháng
  // Đặt thời gian kết thúc của tháng
  const todayEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999); // Ngày cuối tháng

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc đơn hàng trong tháng hiện tại
      },
    },
    {
      $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
    },
    {
      $group: {
        _id: '$userId', // Gộp theo ID người dùng (giả sử bạn có trường `userId` trong order)
        totalAmount: {
          $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] }, // Tổng giá trị đơn hàng
        },
      },
    },
    {
      $sort: { totalAmount: -1 }, // Sắp xếp theo tổng giá trị đơn hàng giảm dần
    },
    {
      $limit: 5, // Lấy top 5 khách hàng
    },
    {
      $lookup: {
        from: 'users', // Tên của collection User
        localField: '_id', // Trường userId trong Order sẽ được nối với trường _id của User
        foreignField: '_id', // Trường _id của User
        as: 'userInfo', // Đặt tên trường kết quả join là userInfo
      },
    },
    {
      $unwind: '$userInfo', // Tách mảng userInfo thành đối tượng để dễ truy cập
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        'userInfo.email': 1,
        'userInfo.fullName': 1,
        'userInfo.phoneNumber': 1,
      }, // Chỉ lấy các trường cần thiết
    },
  ]);

  // Trả kết quả về client
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getTop5CustomersByYear = catchAsync(async (req, res, next) => {
  const today = new Date();
  const currentYear = today.getFullYear(); // Lấy năm hiện tại

  // Đặt thời gian bắt đầu của năm
  const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0); // Ngày đầu năm
  // Đặt thời gian kết thúc của năm
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Ngày cuối năm

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd }, // Lọc đơn hàng trong năm hiện tại
      },
    },
    {
      $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
    },
    {
      $group: {
        _id: '$userId', // Gộp theo ID người dùng (giả sử bạn có trường `userId` trong order)
        totalAmount: {
          $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] }, // Tổng giá trị đơn hàng
        },
      },
    },
    {
      $sort: { totalAmount: -1 }, // Sắp xếp theo tổng giá trị đơn hàng giảm dần
    },
    {
      $limit: 5, // Lấy top 5 khách hàng
    },
    {
      $lookup: {
        from: 'users', // Tên của collection User
        localField: '_id', // Trường userId trong Order sẽ được nối với trường _id của User
        foreignField: '_id', // Trường _id của User
        as: 'userInfo', // Đặt tên trường kết quả join là userInfo
      },
    },
    {
      $unwind: '$userInfo', // Tách mảng userInfo thành đối tượng để dễ truy cập
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        'userInfo.email': 1,
        'userInfo.fullName': 1,
        'userInfo.phoneNumber': 1,
      }, // Chỉ lấy các trường cần thiết
    },
  ]);

  // Trả kết quả về client
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getTop5CustomersByRange = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Kiểm tra và chuyển đổi startDate và endDate thành đối tượng Date
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Kiểm tra xem ngày có hợp lệ không
  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không đúng định dạng.',
    });
  }

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }, // Lọc theo ngày bắt đầu và kết thúc
        status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
    },
    {
      $group: {
        _id: '$userId', // Gộp theo ID người dùng
        totalAmount: {
          $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] }, // Tổng giá trị đơn hàng
        },
      },
    },
    {
      $sort: { totalAmount: -1 }, // Sắp xếp theo tổng giá trị đơn hàng giảm dần
    },
    {
      $limit: 5, // Lấy top 5 khách hàng
    },
    {
      $lookup: {
        from: 'users', // Tên của collection User
        localField: '_id', // Trường userId trong Order sẽ được nối với trường _id của User
        foreignField: '_id', // Trường _id của User
        as: 'userInfo', // Đặt tên trường kết quả join là userInfo
      },
    },
    {
      $unwind: '$userInfo', // Tách mảng userInfo thành đối tượng để dễ truy cập
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        'userInfo.email': 1,
        'userInfo.fullName': 1,
        'userInfo.phoneNumber': 1,
      }, // Chỉ lấy các trường cần thiết
    },
  ]);

  // Trả về kết quả
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

//Top best-selling products
export const getTop3BestSellingProductsByDay = catchAsync(
  async (req, res, next) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày hôm nay
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          'productInfo.name': 1,
          'productInfo.coverImg': 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3BestSellingProductsByWeek = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();

    // Tính ngày đầu tuần (Thứ hai) của tuần hiện tại
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Chuyển sang thứ hai của tuần
    weekStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày đầu tuần

    // Tính ngày cuối tuần (Chủ nhật) của tuần hiện tại
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - today.getDay() + 7); // Chuyển sang chủ nhật của tuần
    weekEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tuần

    // Lọc và nhóm đơn hàng theo tuần
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart, $lte: weekEnd }, // Lọc đơn hàng trong tuần hiện tại
          status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
        },
      },
      {
        $unwind: '$orderItems', // Tách các mục trong giỏ hàng thành các phần tử riêng biệt
      },
      {
        $group: {
          _id: '$orderItems.productId', // Gộp theo ID sản phẩm
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng sản phẩm bán được
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được giảm dần
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tên collection sản phẩm
          localField: '_id', // Trường productId trong OrderItems sẽ nối với _id trong Products
          foreignField: '_id', // Trường _id trong Products
          as: 'productInfo', // Đặt tên cho kết quả nối là productInfo
        },
      },
      {
        $unwind: '$productInfo', // Tách mảng productInfo thành đối tượng để dễ truy cập
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          'productInfo.name': 1,
          'productInfo.coverImg': 1, // Lấy tên sản phẩm và ảnh bìa
        },
      },
    ]);

    // Trả kết quả về client
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3BestSellingProductsByMonth = catchAsync(
  async (req, res, next) => {
    const today = new Date();

    // Đặt ngày bắt đầu là ngày đầu tiên của tháng hiện tại
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Đặt ngày kết thúc là ngày cuối cùng của tháng hiện tại
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: monthEnd },
          status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          'productInfo.name': 1,
          'productInfo.coverImg': 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3BestSellingProductsByYear = catchAsync(
  async (req, res, next) => {
    const today = new Date();

    // Đặt ngày bắt đầu là ngày đầu tiên của năm hiện tại
    const yearStart = new Date(today.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    // Đặt ngày kết thúc là ngày cuối cùng của năm hiện tại
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    yearEnd.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yearStart, $lte: yearEnd },
          status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          'productInfo.name': 1,
          'productInfo.coverImg': 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3BestSellingProductsByRange = catchAsync(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không đúng định dạng.',
      });
    }
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['Đã nhận hàng', 'Đã giao hàng'] },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          'productInfo.name': 1,
          'productInfo.coverImg': 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

// Revenue
export const getRevenueAndRefundsByDay = catchAsync(async (req, res, next) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày hôm nay
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc theo ngày bắt đầu và kết thúc
        status: { $in: ['Đã giao hàng', 'Đã nhận hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }, // Tính tổng doanh thu
        totalRefund: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'Hoàn đơn'] }, // Nếu trạng thái đơn hàng là 'Hoàn đơn', tính bồi hoàn
              60000, // Bồi hoàn 60000 cho đơn hoàn đơn
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì bồi hoàn 30000
                  30000,
                  0, // Nếu không phải thì không tính bồi hoàn
                ],
              },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalRefund: 1,
        totalRealRevenue: {
          $subtract: ['$totalRevenue', '$totalRefund'], // Tính thực nhận (doanh thu - bồi hoàn)
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getRevenueAndRefundsByWeek = catchAsync(async (req, res, next) => {
  // Lấy ngày hiện tại
  const today = new Date();

  // Tính ngày đầu tuần (Thứ hai) của tuần hiện tại
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Chuyển sang thứ hai của tuần
  weekStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày đầu tuần

  // Tính ngày cuối tuần (Chủ nhật) của tuần hiện tại
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() - today.getDay() + 7); // Chuyển sang chủ nhật của tuần
  weekEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tuần

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: weekStart, $lte: weekEnd }, // Lọc theo tuần hiện tại
        status: { $in: ['Đã giao hàng', 'Đã nhận hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }, // Tính tổng doanh thu
        totalRefund: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'Hoàn đơn'] }, // Nếu trạng thái đơn hàng là 'Hoàn đơn', tính bồi hoàn
              60000, // Bồi hoàn 60000 cho đơn hoàn đơn
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì bồi hoàn 30000
                  30000,
                  0, // Nếu không phải thì không tính bồi hoàn
                ],
              },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalRefund: 1,
        totalRealRevenue: {
          $subtract: ['$totalRevenue', '$totalRefund'], // Tính thực nhận (doanh thu - bồi hoàn)
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getRevenueAndRefundsByMonth = catchAsync(
  async (req, res, next) => {
    const today = new Date();

    // Đặt ngày bắt đầu là ngày đầu tiên của tháng hiện tại
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Đặt ngày kết thúc là ngày cuối cùng của tháng hiện tại
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: monthEnd }, // Lọc theo tháng hiện tại
          status: { $in: ['Đã giao hàng', 'Đã nhận hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }, // Tính tổng doanh thu
          totalRefund: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Hoàn đơn'] }, // Nếu trạng thái đơn hàng là 'Hoàn đơn', tính bồi hoàn
                60000, // Bồi hoàn 60000 cho đơn hoàn đơn
                {
                  $cond: [
                    { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì bồi hoàn 30000
                    30000,
                    0, // Nếu không phải thì không tính bồi hoàn
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalRefund: 1,
          totalRealRevenue: {
            $subtract: ['$totalRevenue', '$totalRefund'], // Tính thực nhận (doanh thu - bồi hoàn)
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getRevenueAndRefundsByYear = catchAsync(async (req, res, next) => {
  const today = new Date();

  // Đặt ngày bắt đầu là ngày đầu tiên của năm hiện tại
  const yearStart = new Date(today.getFullYear(), 0, 1); // 0 là tháng 1 (tháng đầu tiên)
  yearStart.setHours(0, 0, 0, 0);

  // Đặt ngày kết thúc là ngày cuối cùng của năm hiện tại
  const yearEnd = new Date(today.getFullYear(), 11, 31); // 11 là tháng 12 (tháng cuối cùng)
  yearEnd.setHours(23, 59, 59, 999);

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd }, // Lọc theo năm hiện tại
        status: { $in: ['Đã giao hàng', 'Đã nhận hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }, // Tính tổng doanh thu
        totalRefund: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'Hoàn đơn'] }, // Nếu trạng thái đơn hàng là 'Hoàn đơn', tính bồi hoàn
              60000, // Bồi hoàn 60000 cho đơn hoàn đơn
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì bồi hoàn 30000
                  30000,
                  0, // Nếu không phải thì không tính bồi hoàn
                ],
              },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalRefund: 1,
        totalRealRevenue: {
          $subtract: ['$totalRevenue', '$totalRefund'], // Tính thực nhận (doanh thu - bồi hoàn)
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getRevenueAndRefundsByRange = catchAsync(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không đúng định dạng.',
      });
    }
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }, // Lọc theo ngày bắt đầu và kết thúc
          status: { $in: ['Đã giao hàng', 'Đã nhận hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }, // Tính tổng doanh thu
          totalRefund: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Hoàn đơn'] }, // Nếu trạng thái đơn hàng là 'Hoàn đơn', tính bồi hoàn
                60000, // Bồi hoàn 60000 cho đơn hoàn đơn
                {
                  $cond: [
                    { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì bồi hoàn 30000
                    30000,
                    0, // Nếu không phải thì không tính bồi hoàn
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalRefund: 1,
          totalRealRevenue: {
            $subtract: ['$totalRevenue', '$totalRefund'], // Tính thực nhận (doanh thu - bồi hoàn)
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

//Order Status Ratio
export const getOrderStatusRatioByDay = catchAsync(async (req, res, next) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày hôm nay
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày hôm nay

  // Lọc và nhóm đơn hàng theo trạng thái, tính tỷ lệ phần trăm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc theo ngày
        status: {
          $in: [
            'Chờ xác nhận',
            'Đã xác nhận',
            'Đóng gói chờ vận chuyển',
            'Đang giao hàng',
            'Đã giao hàng',
            'Hoàn đơn',
            'Đã nhận được hàng',
            'Đã hủy',
          ],
        }, // Các trạng thái cần tính
      },
    },
    {
      $addFields: {
        statusGroup: {
          $cond: [
            { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Trạng thái thành công
            'Thành công',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$statusGroup', // Nhóm theo trạng thái (bao gồm "Thành công")
        count: { $sum: 1 }, // Đếm số lượng đơn hàng theo từng trạng thái
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id', // Trả về tên trạng thái
        count: 1, // Số lượng đơn hàng theo trạng thái
      },
    },
  ]);

  // Đếm tổng số đơn hàng
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
    status: {
      $in: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã nhận được hàng',
        'Đã hủy',
      ],
    },
  });

  // Tính tỷ lệ phần trăm cho từng trạng thái
  const statusWithPercent = result.map((status) => ({
    status: status.status,
    percentage: ((status.count / totalOrders) * 100).toFixed(1), // Tính tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithPercent,
  });
});

export const getOrderStatusRatioByWeek = catchAsync(async (req, res, next) => {
  // Lấy ngày bắt đầu và kết thúc của tuần hiện tại
  const today = new Date();
  const dayOfWeek = today.getDay(); // Ngày trong tuần (0 - Chủ Nhật, 1 - Thứ Hai,...)

  // Tính ngày đầu tuần (Chủ Nhật sẽ là ngày 0)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek); // Chủ nhật tuần này

  // Tính ngày cuối tuần (Chủ Nhật)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Thứ bảy tuần này

  // Lọc và nhóm đơn hàng theo trạng thái trong tuần, tính tỷ lệ phần trăm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: weekStart, $lte: weekEnd }, // Lọc theo tuần
        status: {
          $in: [
            'Chờ xác nhận',
            'Đã xác nhận',
            'Đóng gói chờ vận chuyển',
            'Đang giao hàng',
            'Đã giao hàng',
            'Hoàn đơn',
            'Đã nhận được hàng',
            'Đã hủy',
          ],
        }, // Các trạng thái cần tính
      },
    },
    {
      $addFields: {
        statusGroup: {
          $cond: [
            { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Trạng thái thành công
            'Thành công',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$statusGroup', // Nhóm theo trạng thái (bao gồm "Thành công")
        count: { $sum: 1 }, // Đếm số lượng đơn hàng theo từng trạng thái
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id', // Trả về tên trạng thái
        count: 1, // Số lượng đơn hàng theo trạng thái
      },
    },
  ]);

  // Đếm tổng số đơn hàng trong tuần
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: weekStart, $lte: weekEnd },
    status: {
      $in: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã nhận được hàng',
        'Đã hủy',
      ],
    },
  });

  // Tính tỷ lệ phần trăm cho từng trạng thái
  const statusWithPercent = result.map((status) => ({
    status: status.status,
    percentage: ((status.count / totalOrders) * 100).toFixed(1), // Tính tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithPercent,
  });
});

export const getOrderStatusRatioByMonth = catchAsync(async (req, res, next) => {
  // Lấy ngày bắt đầu và kết thúc của tháng hiện tại
  const today = new Date();

  // Tính ngày đầu tháng
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng

  // Tính ngày cuối tháng
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng

  // Lọc và nhóm đơn hàng theo trạng thái trong tháng, tính tỷ lệ phần trăm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd }, // Lọc theo tháng
        status: {
          $in: [
            'Chờ xác nhận',
            'Đã xác nhận',
            'Đóng gói chờ vận chuyển',
            'Đang giao hàng',
            'Đã giao hàng',
            'Hoàn đơn',
            'Đã nhận được hàng',
            'Đã hủy',
          ],
        }, // Các trạng thái cần tính
      },
    },
    {
      $addFields: {
        statusGroup: {
          $cond: [
            { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Trạng thái thành công
            'Thành công',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$statusGroup', // Nhóm theo trạng thái (bao gồm "Thành công")
        count: { $sum: 1 }, // Đếm số lượng đơn hàng theo từng trạng thái
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id', // Trả về tên trạng thái
        count: 1, // Số lượng đơn hàng theo trạng thái
      },
    },
  ]);

  // Đếm tổng số đơn hàng trong tháng
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: monthStart, $lte: monthEnd },
    status: {
      $in: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã nhận được hàng',
        'Đã hủy',
      ],
    },
  });

  // Tính tỷ lệ phần trăm cho từng trạng thái
  const statusWithPercent = result.map((status) => ({
    status: status.status,
    percentage: ((status.count / totalOrders) * 100).toFixed(1), // Tính tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithPercent,
  });
});

export const getOrderStatusRatioByYear = catchAsync(async (req, res, next) => {
  // Lấy năm hiện tại
  const today = new Date();

  // Tính ngày đầu năm
  const yearStart = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm

  // Tính ngày cuối năm
  const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); // Ngày cuối năm

  // Lọc và nhóm đơn hàng theo trạng thái trong năm, tính tỷ lệ phần trăm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd }, // Lọc theo năm
        status: {
          $in: [
            'Chờ xác nhận',
            'Đã xác nhận',
            'Đóng gói chờ vận chuyển',
            'Đang giao hàng',
            'Đã giao hàng',
            'Hoàn đơn',
            'Đã nhận được hàng',
            'Đã hủy',
          ],
        }, // Các trạng thái cần tính
      },
    },
    {
      $addFields: {
        statusGroup: {
          $cond: [
            { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Trạng thái thành công
            'Thành công',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$statusGroup', // Nhóm theo trạng thái (bao gồm "Thành công")
        count: { $sum: 1 }, // Đếm số lượng đơn hàng theo từng trạng thái
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id', // Trả về tên trạng thái
        count: 1, // Số lượng đơn hàng theo trạng thái
      },
    },
  ]);

  // Đếm tổng số đơn hàng trong năm
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: yearStart, $lte: yearEnd },
    status: {
      $in: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã nhận được hàng',
        'Đã hủy',
      ],
    },
  });

  // Tính tỷ lệ phần trăm cho từng trạng thái
  const statusWithPercent = result.map((status) => ({
    status: status.status,
    percentage: ((status.count / totalOrders) * 100).toFixed(1), // Tính tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithPercent,
  });
});

export const getOrderStatusRatioByRange = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không đúng định dạng.',
    });
  }

  // Lọc và nhóm đơn hàng theo trạng thái, tính tỷ lệ phần trăm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }, // Lọc theo ngày
        status: {
          $in: [
            'Chờ xác nhận',
            'Đã xác nhận',
            'Đóng gói chờ vận chuyển',
            'Đang giao hàng',
            'Đã giao hàng',
            'Hoàn đơn',
            'Đã nhận được hàng',
            'Đã hủy',
          ],
        }, // Các trạng thái cần tính
      },
    },
    {
      $addFields: {
        statusGroup: {
          $cond: [
            { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Trạng thái thành công
            'Thành công',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$statusGroup', // Nhóm theo trạng thái (bao gồm "Thành công")
        count: { $sum: 1 }, // Đếm số lượng đơn hàng theo từng trạng thái
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id', // Trả về tên trạng thái
        count: 1, // Số lượng đơn hàng theo trạng thái
      },
    },
  ]);

  // Đếm tổng số đơn hàng
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: start, $lte: end },
    status: {
      $in: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã nhận được hàng',
        'Đã hủy',
      ],
    },
  });

  // Tính tỷ lệ phần trăm cho từng trạng thái
  const statusWithPercent = result.map((status) => ({
    status: status.status,
    percentage: ((status.count / totalOrders) * 100).toFixed(1), // Tính tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithPercent,
  });
});

// Top Product Inventory

export const getTop3ProductsByInventoryByDay = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu cho ngày hiện tại

    // Tính thời gian kết thúc trong ngày hiện tại (23:59:59)
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: endOfDay }, // Lọc sản phẩm theo ngày hiện tại
        },
      },
      {
        $unwind: '$variants', // Tách mảng variants để xử lý từng variant
      },
      {
        $unwind: '$variants.sizes', // Tách mảng sizes để xử lý từng size của variant
      },
      {
        $group: {
          _id: '$_id', // Nhóm theo sản phẩm (ID sản phẩm)
          totalInventory: { $sum: '$variants.sizes.inventory' }, // Tính tổng inventory của sản phẩm (từ tất cả các variants và sizes)
          name: { $first: '$name' }, // Lấy tên sản phẩm
          coverImg: { $first: '$coverImg' }, // Lấy ảnh bìa của sản phẩm
          slug: { $first: '$slug' }, // Lấy slug của sản phẩm
        },
      },
      {
        $sort: { totalInventory: -1 }, // Sắp xếp giảm dần theo tổng tồn kho
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm có tồn kho cao nhất
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3ProductsByInventoryByWeek = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();
    const dayOfWeek = today.getDay(); // Lấy số ngày trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)

    // Tính ngày đầu tuần (Chủ Nhật)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Trừ đi số ngày trong tuần để đến Chủ Nhật
    startOfWeek.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

    // Tính ngày cuối tuần (Thứ Bảy)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Cộng thêm 6 ngày để đến Thứ Bảy
    endOfWeek.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tuần

    const result = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lt: endOfWeek }, // Lọc sản phẩm theo tuần hiện tại
        },
      },
      {
        $unwind: '$variants', // Tách mảng variants để xử lý từng variant
      },
      {
        $unwind: '$variants.sizes', // Tách mảng sizes để xử lý từng size của variant
      },
      {
        $group: {
          _id: '$_id', // Nhóm theo sản phẩm (ID sản phẩm)
          totalInventory: { $sum: '$variants.sizes.inventory' }, // Tính tổng inventory của sản phẩm (từ tất cả các variants và sizes)
          name: { $first: '$name' }, // Lấy tên sản phẩm
          coverImg: { $first: '$coverImg' }, // Lấy ảnh bìa của sản phẩm
          slug: { $first: '$slug' }, // Lấy slug của sản phẩm
        },
      },
      {
        $sort: { totalInventory: -1 }, // Sắp xếp giảm dần theo tổng tồn kho
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm có tồn kho cao nhất
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3ProductsByInventoryByMonth = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();

    // Tính ngày đầu tháng
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tiên của tháng
    startOfMonth.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

    // Tính ngày cuối tháng
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối cùng của tháng
    endOfMonth.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tháng

    const result = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }, // Lọc sản phẩm theo tháng hiện tại
        },
      },
      {
        $unwind: '$variants', // Tách mảng variants để xử lý từng variant
      },
      {
        $unwind: '$variants.sizes', // Tách mảng sizes để xử lý từng size của variant
      },
      {
        $group: {
          _id: '$_id', // Nhóm theo sản phẩm (ID sản phẩm)
          totalInventory: { $sum: '$variants.sizes.inventory' }, // Tính tổng inventory của sản phẩm (từ tất cả các variants và sizes)
          name: { $first: '$name' }, // Lấy tên sản phẩm
          coverImg: { $first: '$coverImg' }, // Lấy ảnh bìa của sản phẩm
          slug: { $first: '$slug' }, // Lấy slug của sản phẩm
        },
      },
      {
        $sort: { totalInventory: -1 }, // Sắp xếp giảm dần theo tổng tồn kho
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm có tồn kho cao nhất
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3ProductsByInventoryByYear = catchAsync(
  async (req, res, next) => {
    // Lấy năm hiện tại
    const today = new Date();

    // Tính ngày đầu năm
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Ngày đầu tiên của năm
    startOfYear.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

    // Tính ngày cuối năm
    const endOfYear = new Date(today.getFullYear(), 11, 31); // Ngày cuối cùng của năm
    endOfYear.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối năm

    const result = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lt: endOfYear }, // Lọc sản phẩm theo năm hiện tại
        },
      },
      {
        $unwind: '$variants', // Tách mảng variants để xử lý từng variant
      },
      {
        $unwind: '$variants.sizes', // Tách mảng sizes để xử lý từng size của variant
      },
      {
        $group: {
          _id: '$_id', // Nhóm theo sản phẩm (ID sản phẩm)
          totalInventory: { $sum: '$variants.sizes.inventory' }, // Tính tổng inventory của sản phẩm (từ tất cả các variants và sizes)
          name: { $first: '$name' }, // Lấy tên sản phẩm
          coverImg: { $first: '$coverImg' }, // Lấy ảnh bìa của sản phẩm
          slug: { $first: '$slug' }, // Lấy slug của sản phẩm
        },
      },
      {
        $sort: { totalInventory: -1 }, // Sắp xếp giảm dần theo tổng tồn kho
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm có tồn kho cao nhất
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getTop3ProductsByInventoryByRange = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không đúng định dạng.',
      });
    }

    const result = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }, // Lọc sản phẩm theo ngày hiện tại
        },
      },
      {
        $unwind: '$variants', // Tách mảng variants để xử lý từng variant
      },
      {
        $unwind: '$variants.sizes', // Tách mảng sizes để xử lý từng size của variant
      },
      {
        $group: {
          _id: '$_id', // Nhóm theo sản phẩm (ID sản phẩm)
          totalInventory: { $sum: '$variants.sizes.inventory' }, // Tính tổng inventory của sản phẩm (từ tất cả các variants và sizes)
          name: { $first: '$name' }, // Lấy tên sản phẩm
          coverImg: { $first: '$coverImg' }, // Lấy ảnh bìa của sản phẩm
          slug: { $first: '$slug' }, // Lấy slug của sản phẩm
        },
      },
      {
        $sort: { totalInventory: -1 }, // Sắp xếp giảm dần theo tổng tồn kho
      },
      {
        $limit: 3, // Lấy top 3 sản phẩm có tồn kho cao nhất
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
