import Order from '../models/order.model';
import Product from '../models/product.model';

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
        status: { $in: ['Đã nhận được hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
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
      $limit: 3, // Lấy top 5 khách hàng
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
        status: { $in: ['Đã nhận được hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
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
      $limit: 3, // Lấy top 5 khách hàng
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
  // Lấy ngày hiện tại
  const today = new Date();

  // Tính ngày đầu tháng
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tiên của tháng
  monthStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày đầu tháng

  // Tính ngày cuối tháng
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối cùng của tháng
  monthEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tháng

  // Lọc và nhóm đơn hàng theo tháng
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd }, // Lọc đơn hàng trong tháng hiện tại
        status: { $in: ['Đã nhận được hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
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
      $limit: 3, // Lấy top 5 khách hàng
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
  // Lấy ngày hiện tại
  const today = new Date();

  // Tính ngày đầu năm
  const yearStart = new Date(today.getFullYear(), 0, 1); // Ngày đầu tiên của năm
  yearStart.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày đầu năm

  // Tính ngày cuối năm
  const yearEnd = new Date(today.getFullYear(), 11, 31); // Ngày cuối cùng của năm
  yearEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối năm

  // Lọc và nhóm đơn hàng theo năm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd }, // Lọc đơn hàng trong năm hiện tại
        status: { $in: ['Đã nhận được hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
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
      $limit: 3, // Lấy top 5 khách hàng
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
        status: { $in: ['Đã nhận được hàng', 'Đã giao hàng'] }, // Lọc theo trạng thái đơn hàng
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
      $limit: 3, // Lấy top 5 khách hàng
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
    todayEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày hôm nay

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc đơn hàng trong ngày hôm nay
          status: { $nin: ['Đã hủy', 'Hoàn đơn'] }, // Loại bỏ đơn hàng đã hủy và hoàn đơn
        },
      },
      {
        $unwind: '$orderItems', // Giải nén các orderItems (sản phẩm trong mỗi đơn hàng)
      },
      {
        $group: {
          _id: '$orderItems.productId', // Nhóm theo productId
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng bán được
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          }, // Doanh thu dự kiến
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được, giảm dần
      },
      {
        $limit: 3, // Lấy 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tra cứu thông tin sản phẩm
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo', // Giải nén thông tin sản phẩm
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
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
    const today = new Date();
    const dayOfWeek = today.getDay(); // Lấy ngày trong tuần (0-6, chủ nhật = 0)
    const startOfWeek = new Date(today); // Bắt đầu từ ngày chủ nhật của tuần
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Tính ngày chủ nhật
    startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ là 00:00:00

    const endOfWeek = new Date(startOfWeek); // Kết thúc tuần vào ngày chủ nhật kế tiếp
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Tính ngày cuối tuần (thứ bảy)
    endOfWeek.setHours(23, 59, 59, 999); // Đặt giờ là 23:59:59

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek }, // Lọc đơn hàng trong tuần hiện tại
          status: { $nin: ['Đã hủy', 'Hoàn đơn'] }, // Loại bỏ đơn hàng đã hủy và hoàn đơn
        },
      },
      {
        $unwind: '$orderItems', // Giải nén các orderItems (sản phẩm trong mỗi đơn hàng)
      },
      {
        $group: {
          _id: '$orderItems.productId', // Nhóm theo productId
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng bán được
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          }, // Doanh thu dự kiến
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được, giảm dần
      },
      {
        $limit: 3, // Lấy 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tra cứu thông tin sản phẩm
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo', // Giải nén thông tin sản phẩm
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
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

export const getTop3BestSellingProductsByMonth = catchAsync(
  async (req, res, next) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Lấy ngày đầu tháng
    startOfMonth.setHours(0, 0, 0, 0); // Đặt giờ là 00:00:00

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Lấy ngày cuối tháng
    endOfMonth.setHours(23, 59, 59, 999); // Đặt giờ là 23:59:59

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Lọc đơn hàng trong tháng hiện tại
          status: { $nin: ['Đã hủy', 'Hoàn đơn'] }, // Loại bỏ đơn hàng đã hủy và hoàn đơn
        },
      },
      {
        $unwind: '$orderItems', // Giải nén các orderItems (sản phẩm trong mỗi đơn hàng)
      },
      {
        $group: {
          _id: '$orderItems.productId', // Nhóm theo productId
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng bán được
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          }, // Doanh thu dự kiến
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được, giảm dần
      },
      {
        $limit: 3, // Lấy 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tra cứu thông tin sản phẩm
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo', // Giải nén thông tin sản phẩm
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
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
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Lấy ngày đầu năm
    startOfYear.setHours(0, 0, 0, 0); // Đặt giờ là 00:00:00

    const endOfYear = new Date(today.getFullYear(), 11, 31); // Lấy ngày cuối năm
    endOfYear.setHours(23, 59, 59, 999); // Đặt giờ là 23:59:59

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }, // Lọc đơn hàng trong năm hiện tại
          status: { $nin: ['Đã hủy', 'Hoàn đơn'] }, // Loại bỏ đơn hàng đã hủy và hoàn đơn
        },
      },
      {
        $unwind: '$orderItems', // Giải nén các orderItems (sản phẩm trong mỗi đơn hàng)
      },
      {
        $group: {
          _id: '$orderItems.productId', // Nhóm theo productId
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng bán được
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          }, // Doanh thu dự kiến
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được, giảm dần
      },
      {
        $limit: 3, // Lấy 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tra cứu thông tin sản phẩm
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo', // Giải nén thông tin sản phẩm
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
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
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc đơn hàng trong khoảng thời gian
          status: { $nin: ['Đã hủy', 'Hoàn đơn'] }, // Loại bỏ đơn hàng đã hủy và hoàn đơn
        },
      },
      {
        $unwind: '$orderItems', // Giải nén các orderItems (sản phẩm trong mỗi đơn hàng)
      },
      {
        $group: {
          _id: '$orderItems.productId', // Nhóm theo productId
          totalSold: { $sum: '$orderItems.quantity' }, // Tổng số lượng bán được
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          }, // Doanh thu dự kiến
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo số lượng bán được, giảm dần
      },
      {
        $limit: 3, // Lấy 3 sản phẩm bán chạy nhất
      },
      {
        $lookup: {
          from: 'products', // Tra cứu thông tin sản phẩm
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo', // Giải nén thông tin sản phẩm
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
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
  todayEnd.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày hôm nay

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd }, // Lọc theo khoảng thời gian trong ngày
        status: { $in: ['Đã giao hàng', 'Đã nhận được hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Chỉ tính doanh thu từ các đơn đã giao hoặc đã nhận
              '$totalPrice',
              0,
            ],
          },
        },
        totalRefund: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$paymentMethod', 'COD'] }, // Chỉ tính bồi hoàn nếu phương thức thanh toán là COD
                  { $eq: ['$status', 'Hoàn đơn'] },
                ],
              },
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì +30000
                  30000,
                  60000, // Nếu statusShip là false thì +60000
                ],
              },
              0, // Nếu không phải thì không tính bồi hoàn
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1, // Tổng doanh thu
        totalRefund: 1, // Tổng bồi hoàn
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
        status: { $in: ['Đã giao hàng', 'Đã nhận được hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Chỉ tính doanh thu từ các đơn đã giao hoặc đã nhận
              '$totalPrice',
              0,
            ],
          },
        },
        totalRefund: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$paymentMethod', 'COD'] }, // Chỉ tính bồi hoàn nếu phương thức thanh toán là COD
                  { $eq: ['$status', 'Hoàn đơn'] },
                ],
              },
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì +30000
                  30000,
                  60000, // Nếu statusShip là false thì +60000
                ],
              },
              0, // Nếu không phải thì không tính bồi hoàn
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1, // Tổng doanh thu
        totalRefund: 1, // Tổng bồi hoàn
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
    // Lấy ngày hiện tại
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
          status: { $in: ['Đã giao hàng', 'Đã nhận được hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Chỉ tính doanh thu từ các đơn đã giao hoặc đã nhận
                '$totalPrice',
                0,
              ],
            },
          },
          totalRefund: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentMethod', 'COD'] }, // Chỉ tính bồi hoàn nếu phương thức thanh toán là COD
                    { $eq: ['$status', 'Hoàn đơn'] },
                  ],
                },
                {
                  $cond: [
                    { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì +30000
                    30000,
                    60000, // Nếu statusShip là false thì +60000
                  ],
                },
                0, // Nếu không phải thì không tính bồi hoàn
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1, // Tổng doanh thu
          totalRefund: 1, // Tổng bồi hoàn
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
  // Lấy ngày hiện tại
  const today = new Date();

  // Đặt ngày bắt đầu là ngày đầu tiên của năm hiện tại
  const yearStart = new Date(today.getFullYear(), 0, 1); // Tháng 0 là tháng 1
  yearStart.setHours(0, 0, 0, 0);

  // Đặt ngày kết thúc là ngày cuối cùng của năm hiện tại
  const yearEnd = new Date(today.getFullYear(), 11, 31); // Tháng 11 là tháng 12
  yearEnd.setHours(23, 59, 59, 999);

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd }, // Lọc theo năm hiện tại
        status: { $in: ['Đã giao hàng', 'Đã nhận được hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] }, // Chỉ tính doanh thu từ các đơn đã giao hoặc đã nhận
              '$totalPrice',
              0,
            ],
          },
        },
        totalRefund: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$paymentMethod', 'COD'] }, // Chỉ tính bồi hoàn nếu phương thức thanh toán là COD
                  { $eq: ['$status', 'Hoàn đơn'] },
                ],
              },
              {
                $cond: [
                  { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì +30000
                  30000,
                  60000, // Nếu statusShip là false thì +60000
                ],
              },
              0, // Nếu không phải thì không tính bồi hoàn
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1, // Tổng doanh thu
        totalRefund: 1, // Tổng bồi hoàn
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
          createdAt: { $gte: start, $lte: end }, // Lọc theo khoảng thời gian
          status: { $in: ['Đã giao hàng', 'Đã nhận được hàng', 'Hoàn đơn'] }, // Lọc theo trạng thái đơn hàng
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']] },
                '$totalPrice',
                0,
              ],
            },
          },
          totalRefund: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentMethod', 'COD'] }, // Chỉ tính bồi hoàn nếu phương thức thanh toán là COD
                    { $eq: ['$status', 'Hoàn đơn'] },
                  ],
                },
                {
                  $cond: [
                    { $eq: ['$statusShip', true] }, // Nếu statusShip là true thì +30000
                    30000,
                    60000, // Nếu statusShip là false thì +60000
                  ],
                },
                0, // Nếu không phải thì không tính bồi hoàn
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1, // Tổng doanh thu
          totalRefund: 1, // Tổng bồi hoàn
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
    count: status.count,
    percentage: (status.count / totalOrders) * 100, // Tính tỷ lệ phần trăm
  }));

  // Tính tổng tỷ lệ phần trăm để tránh vượt 100%
  const totalPercentage = statusWithPercent.reduce(
    (sum, status) => sum + status.percentage,
    0
  );

  // Cập nhật tỷ lệ phần trăm sau khi tính tổng
  const statusWithFinalPercent = statusWithPercent.map((status) => ({
    ...status,
    percentage: ((status.percentage / totalPercentage) * 100).toFixed(1), // Điều chỉnh tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithFinalPercent,
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
    count: status.count,
    percentage: (status.count / totalOrders) * 100, // Tính tỷ lệ phần trăm mà không làm tròn
  }));

  // Tính tổng tỷ lệ phần trăm để tránh vượt 100%
  const totalPercentage = statusWithPercent.reduce(
    (sum, status) => sum + status.percentage,
    0
  );

  // Cập nhật tỷ lệ phần trăm sau khi tính tổng
  const statusWithFinalPercent = statusWithPercent.map((status) => ({
    ...status,
    percentage: ((status.percentage / totalPercentage) * 100).toFixed(1), // Điều chỉnh tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithFinalPercent,
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
    count: status.count,
    percentage: (status.count / totalOrders) * 100, // Tính tỷ lệ phần trăm mà không làm tròn
  }));

  // Tính tổng tỷ lệ phần trăm để tránh vượt 100%
  const totalPercentage = statusWithPercent.reduce(
    (sum, status) => sum + status.percentage,
    0
  );

  // Cập nhật tỷ lệ phần trăm sau khi tính tổng
  const statusWithFinalPercent = statusWithPercent.map((status) => ({
    ...status,
    percentage: ((status.percentage / totalPercentage) * 100).toFixed(1), // Điều chỉnh tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithFinalPercent,
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
    count: status.count,
    percentage: (status.count / totalOrders) * 100, // Tính tỷ lệ phần trăm mà không làm tròn ngay
  }));

  // Tính tổng tỷ lệ phần trăm để tránh vượt 100%
  const totalPercentage = statusWithPercent.reduce(
    (sum, status) => sum + status.percentage,
    0
  );

  // Cập nhật tỷ lệ phần trăm sau khi tính tổng
  const statusWithFinalPercent = statusWithPercent.map((status) => ({
    ...status,
    percentage: ((status.percentage / totalPercentage) * 100).toFixed(1), // Điều chỉnh tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithFinalPercent,
  });
});

export const getOrderStatusRatioByRange = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Kiểm tra định dạng ngày
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

  // Đếm tổng số đơn hàng trong khoảng thời gian
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
    count: status.count,
    percentage: (status.count / totalOrders) * 100, // Tính tỷ lệ phần trăm mà không làm tròn ngay
  }));

  // Tính tổng tỷ lệ phần trăm để tránh vượt 100%
  const totalPercentage = statusWithPercent.reduce(
    (sum, status) => sum + status.percentage,
    0
  );

  // Cập nhật tỷ lệ phần trăm sau khi tính tổng
  const statusWithFinalPercent = statusWithPercent.map((status) => ({
    ...status,
    percentage: ((status.percentage / totalPercentage) * 100).toFixed(1), // Điều chỉnh tỷ lệ phần trăm
  }));

  // Trả kết quả
  res.status(200).json({
    status: 'success',
    data: statusWithFinalPercent,
  });
});

// Top Product Inventory

export const getTop3ProductsByInventoryByDay = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 (bắt đầu ngày hôm nay)

    // Lấy cuối ngày hôm nay (23:59:59)
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Lấy các đơn hàng chưa hủy và chưa hoàn trong ngày hiện tại
    const orders = await Order.find({
      status: { $nin: ['Hoàn đơn', 'Đã hủy'] },
      createdAt: { $gte: today, $lt: endOfDay }, // Lọc đơn hàng trong ngày hiện tại
    }).populate('orderItems.productId');

    // Tính toán số lượng bán ra cho từng sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId._id.toString();
        const quantitySold = item.quantity;

        // Cộng dồn số lượng bán ra cho mỗi sản phẩm
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += quantitySold; // Cộng thêm số lượng bán cho sản phẩm
      });
    });

    // Lấy tất cả sản phẩm và tính toán tồn kho
    const products = await Product.find();

    // Tính tồn kho cho từng sản phẩm và số lượng bán ra
    const productStock = products.map((product) => {
      let totalStock = 0;
      let totalSold = 0;

      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          totalStock += size.inventory; // Tổng số lượng ban đầu
        });
      });

      // Lấy số lượng bán ra cho sản phẩm hiện tại từ productSales
      totalSold = productSales[product._id.toString()] || 0;

      const stockPercentage =
        totalStock === 0
          ? 100
          : Math.max(0, (totalStock - totalSold) / totalStock) * 100;

      return {
        productId: product._id,
        name: product.name,
        coverImg: product.coverImg,
        slug: product.slug,
        stockPercentage,
        totalStock,
        totalSold,
      };
    });

    // Sắp xếp sản phẩm theo tồn kho giảm dần
    const topProducts = productStock
      .sort((a, b) => b.stockPercentage - a.stockPercentage)
      .slice(0, 3); // Lấy 3 sản phẩm đầu tiên

    res.status(200).json({
      status: 'success',
      data: topProducts,
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

    // Lấy các đơn hàng chưa hủy và chưa hoàn trong tuần hiện tại
    const orders = await Order.find({
      status: { $nin: ['Hoàn đơn', 'Đã hủy'] },
      createdAt: { $gte: startOfWeek, $lt: endOfWeek }, // Lọc đơn hàng trong tuần hiện tại
    }).populate('orderItems.productId');

    // Tính toán số lượng bán ra cho từng sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId._id.toString();
        const quantitySold = item.quantity;

        // Cộng dồn số lượng bán ra cho mỗi sản phẩm
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += quantitySold; // Cộng thêm số lượng bán cho sản phẩm
      });
    });

    // Lấy tất cả sản phẩm và tính toán tồn kho
    const products = await Product.find();

    // Tính tồn kho cho từng sản phẩm và số lượng bán ra
    const productStock = products.map((product) => {
      let totalStock = 0;
      let totalSold = 0;

      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          totalStock += size.inventory; // Tổng số lượng ban đầu
        });
      });

      // Lấy số lượng bán ra cho sản phẩm hiện tại từ productSales
      totalSold = productSales[product._id.toString()] || 0;

      const stockPercentage =
        totalStock === 0
          ? 100
          : Math.max(0, (totalStock - totalSold) / totalStock) * 100;

      return {
        productId: product._id,
        name: product.name,
        coverImg: product.coverImg,
        slug: product.slug,
        stockPercentage,
        totalStock,
        totalSold,
      };
    });

    // Sắp xếp sản phẩm theo tồn kho giảm dần
    const topProducts = productStock
      .sort((a, b) => b.stockPercentage - a.stockPercentage)
      .slice(0, 3); // Lấy 3 sản phẩm đầu tiên

    res.status(200).json({
      status: 'success',
      data: topProducts,
    });
  }
);

export const getTop3ProductsByInventoryByMonth = catchAsync(
  async (req, res, next) => {
    // Lấy ngày hiện tại
    const today = new Date();

    // Tính ngày đầu tháng
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
    startOfMonth.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

    // Tính ngày cuối tháng
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
    endOfMonth.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối tháng

    // Lấy các đơn hàng chưa hủy và chưa hoàn trong tháng hiện tại
    const orders = await Order.find({
      status: { $nin: ['Hoàn đơn', 'Đã hủy'] },
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }, // Lọc đơn hàng trong tháng hiện tại
    }).populate('orderItems.productId');

    // Tính toán số lượng bán ra cho từng sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId._id.toString();
        const quantitySold = item.quantity;

        // Cộng dồn số lượng bán ra cho mỗi sản phẩm
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += quantitySold; // Cộng thêm số lượng bán cho sản phẩm
      });
    });

    // Lấy tất cả sản phẩm và tính toán tồn kho
    const products = await Product.find();

    // Tính tồn kho cho từng sản phẩm và số lượng bán ra
    const productStock = products.map((product) => {
      let totalStock = 0;
      let totalSold = 0;

      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          totalStock += size.inventory; // Tổng số lượng ban đầu
        });
      });

      // Lấy số lượng bán ra cho sản phẩm hiện tại từ productSales
      totalSold = productSales[product._id.toString()] || 0;

      const stockPercentage =
        totalStock === 0
          ? 100
          : Math.max(0, (totalStock - totalSold) / totalStock) * 100;

      return {
        productId: product._id,
        name: product.name,
        coverImg: product.coverImg,
        slug: product.slug,
        stockPercentage,
        totalStock,
        totalSold,
      };
    });

    // Sắp xếp sản phẩm theo tồn kho giảm dần
    const topProducts = productStock
      .sort((a, b) => b.stockPercentage - a.stockPercentage)
      .slice(0, 3); // Lấy 3 sản phẩm đầu tiên

    res.status(200).json({
      status: 'success',
      data: topProducts,
    });
  }
);

export const getTop3ProductsByInventoryByYear = catchAsync(
  async (req, res, next) => {
    // Lấy năm hiện tại
    const today = new Date();

    // Tính ngày đầu năm
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
    startOfYear.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

    // Tính ngày cuối năm
    const endOfYear = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
    endOfYear.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày cuối năm

    // Lấy các đơn hàng chưa hủy và chưa hoàn trong năm hiện tại
    const orders = await Order.find({
      status: { $nin: ['Hoàn đơn', 'Đã hủy'] },
      createdAt: { $gte: startOfYear, $lt: endOfYear }, // Lọc đơn hàng trong năm hiện tại
    }).populate('orderItems.productId');

    // Tính toán số lượng bán ra cho từng sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId._id.toString();
        const quantitySold = item.quantity;

        // Cộng dồn số lượng bán ra cho mỗi sản phẩm
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += quantitySold; // Cộng thêm số lượng bán cho sản phẩm
      });
    });

    // Lấy tất cả sản phẩm và tính toán tồn kho
    const products = await Product.find();

    // Tính tồn kho cho từng sản phẩm và số lượng bán ra
    const productStock = products.map((product) => {
      let totalStock = 0;
      let totalSold = 0;

      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          totalStock += size.inventory; // Tổng số lượng ban đầu
        });
      });

      // Lấy số lượng bán ra cho sản phẩm hiện tại từ productSales
      totalSold = productSales[product._id.toString()] || 0;

      const stockPercentage =
        totalStock === 0
          ? 100
          : Math.max(0, (totalStock - totalSold) / totalStock) * 100;

      return {
        productId: product._id,
        name: product.name,
        coverImg: product.coverImg,
        slug: product.slug,
        stockPercentage,
        totalStock,
        totalSold,
      };
    });

    // Sắp xếp sản phẩm theo tồn kho giảm dần
    const topProducts = productStock
      .sort((a, b) => b.stockPercentage - a.stockPercentage)
      .slice(0, 3); // Lấy 3 sản phẩm đầu tiên

    res.status(200).json({
      status: 'success',
      data: topProducts,
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

    const orders = await Order.find({
      status: { $nin: ['Hoàn đơn', 'Đã hủy'] },
      createdAt: { $gte: startDate, $lt: endDate }, // Lọc đơn hàng trong khoảng thời gian
    }).populate('orderItems.productId');

    // Tính toán số lượng bán ra cho từng sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId._id.toString();
        const quantitySold = item.quantity;

        // Cộng dồn số lượng bán ra cho mỗi sản phẩm
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += quantitySold; // Cộng thêm số lượng bán cho sản phẩm
      });
    });

    // Lấy tất cả sản phẩm và tính toán tồn kho
    const products = await Product.find();

    // Tính tồn kho cho từng sản phẩm và số lượng bán ra
    const productStock = products.map((product) => {
      let totalStock = 0;
      let totalSold = 0;

      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          totalStock += size.inventory; // Tổng số lượng ban đầu
        });
      });

      // Lấy số lượng bán ra cho sản phẩm hiện tại từ productSales
      totalSold = productSales[product._id.toString()] || 0;

      const stockPercentage =
        totalStock === 0
          ? 100
          : Math.max(0, (totalStock - totalSold) / totalStock) * 100;

      return {
        productId: product._id,
        name: product.name,
        coverImg: product.coverImg,
        slug: product.slug,
        stockPercentage,
        totalStock,
        totalSold,
      };
    });

    // Sắp xếp sản phẩm theo tồn kho giảm dần
    const topProducts = productStock
      .sort((a, b) => b.stockPercentage - a.stockPercentage)
      .slice(0, 3); // Lấy 3 sản phẩm đầu tiên

    res.status(200).json({
      status: 'success',
      data: topProducts,
    });
  }
);
