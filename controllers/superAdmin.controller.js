import { StatusCodes } from 'http-status-codes';
import Admin from '../models/admin.model';
import User from '../models/user.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import jwt from 'jsonwebtoken';
import {
  loginSchema,
  registerSuperAdminSchema,
} from '../validator/user.validator';
import { sendMaiBlockedOrder } from '../services/email.service';
import Order from '../models/order.model';
import { format } from 'date-fns';

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendRes = (admin, statusCode, res) => {
  const token = signToken(admin._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };

  res.cookie('adminJwt', token, cookieOptions);
  admin.password = undefined;
  res.status(statusCode).json({
    status: true,
    data: admin,
    adminToken: token,
    message: 'Thành công',
  });
};

// Helper để lấy danh sách với phân trang
const getPaginatedData = async (model, currentUserId = null, page, limit) => {
  const skip = (page - 1) * limit;

  // Lấy danh sách người dùng với phân trang, trừ người dùng hiện tại
  const list = await model.find().skip(skip).limit(limit);

  // Đếm tổng số người dùng
  const total = await model.countDocuments();

  const totalPages = Math.ceil(total / limit);

  return { list, total, totalPages };
};

export const createAccBySuperAdmin = catchAsync(async (req, res, next) => {
  const { email, fullName, password, role, phoneNumber } = req.body;

  // Validate dữ liệu
  const { error } = registerSuperAdminSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  // Kiểm tra vai trò và tìm kiếm tài khoản đã tồn tại
  const model = role === 'admin' || role === 'superadmin' ? Admin : User;
  const existedUser = await model.findOne({ email });

  if (existedUser) {
    return next(
      new AppError(
        'Email đã tồn tại, vui lòng thử lại',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Tạo tài khoản mới
  const newUser =
    role === 'admin' || role === 'superadmin'
      ? { email, fullName, password, role }
      : { email, fullName, password, phoneNumber };

  await model.create(newUser);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
  });
});

export const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Validate từ form
  const { error } = loginSchema.validate({ email }, { abortEarly: false });
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  //Tìm user với email
  const admin = await Admin.findOne({ email }).select('+password');
  //Kiểm tra liệu user có tồn tại trong db hay không và check password
  if (!admin || !(await admin.checkPassword(password))) {
    return next(
      new AppError(
        'Email hoặc mật khẩu không chính xác!',
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  if (admin.active === false)
    return next(
      new AppError(
        'Tài khoản của bạn đã khóa, vui lòng liên hệ với quản trị viên!!',
        StatusCodes.FORBIDDEN
      )
    );
  createSendRes(admin, StatusCodes.OK, res);
});

// Xác định tài khoản mục tiêu và vai trò của tài khoản đó.
// Cập nhật trạng thái isBlocked của tài khoản được chỉ định.

export const getAllUserAccounts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;

  const {
    list: users,
    total: totalUsers,
    totalPages: userPages,
  } = await getPaginatedData(User, page, limit);

  // Lấy danh sách userId
  const userIds = users.map((user) => user._id);

  // Lấy thông tin đơn hàng theo userId
  const orders = await Order.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: '$userId',
        totalOrders: { $sum: 1 },
        totalReturnOrders: {
          $sum: {
            $cond: { if: { $eq: ['$status', 'Hoàn đơn'] }, then: 1, else: 0 },
          },
        },
        totalSuccessOrders: {
          $sum: {
            $cond: {
              if: {
                $in: ['$status', ['Đã giao hàng', 'Đã nhận được hàng']],
              },
              then: 1,
              else: 0,
            },
          },
        },
        totalCanceledOrders: {
          $sum: {
            $cond: { if: { $eq: ['$status', 'Đã hủy'] }, then: 1, else: 0 },
          },
        },
        totalDamage: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Hoàn đơn'] },
              then: {
                $add: [
                  {
                    $cond: {
                      if: { $eq: ['$statusShip', true] },
                      then: 60000,
                      else: 30000,
                    },
                  },
                ],
              },
              else: 0,
            },
          },
        },
      },
    },
    {
      $project: {
        userId: '$_id',
        totalOrders: 1,
        totalReturnOrders: 1,
        totalSuccessOrders: 1,
        totalCanceledOrders: 1,
        totalDamage: 1,
        returnRate: {
          $round: [
            {
              $cond: {
                if: { $ne: ['$totalOrders', 0] },
                then: {
                  $multiply: [
                    { $divide: ['$totalReturnOrders', '$totalOrders'] },
                    100,
                  ],
                },
                else: 0,
              },
            },
            2,
          ],
        },
        successRate: {
          $round: [
            {
              $cond: {
                if: { $ne: ['$totalOrders', 0] },
                then: {
                  $multiply: [
                    { $divide: ['$totalSuccessOrders', '$totalOrders'] },
                    100,
                  ],
                },
                else: 0,
              },
            },
            2,
          ],
        },
        cancelRate: {
          $round: [
            {
              $cond: {
                if: { $ne: ['$totalOrders', 0] },
                then: {
                  $multiply: [
                    { $divide: ['$totalCanceledOrders', '$totalOrders'] },
                    100,
                  ],
                },
                else: 0,
              },
            },
            2,
          ],
        },
      },
    },
  ]);

  // Gắn dữ liệu orders vào users
  const userOrderData = users.map((user) => {
    const orderData = orders.find(
      (order) => String(order.userId) === String(user._id)
    ) || {
      totalOrders: 0,
      totalReturnOrders: 0,
      totalSuccessOrders: 0,
      totalCanceledOrders: 0,
      totalDamage: 0,
      returnRate: 0,
      successRate: 0,
      cancelRate: 0,
    };
    return {
      userId: user._id,
      ...user.toObject(),
      totalOrders: orderData.totalOrders,
      totalReturnOrders: orderData.totalReturnOrders,
      totalSuccessOrders: orderData.totalSuccessOrders,
      totalCanceledOrders: orderData.totalCanceledOrders,
      totalDamage: orderData.totalDamage,
      returnRate: orderData.returnRate,
      successRate: orderData.successRate,
      cancelRate: orderData.cancelRate,
    };
  });

  res.status(200).json({
    status: true,
    message: 'Thành công',
    data: {
      list: userOrderData,
      pagination: {
        currentPage: page,
        totalPages: userPages,
        limit,
        totalUsers,
      },
    },
  });
});

export const getOrderStatistics = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Lấy tất cả các đơn hàng của người dùng
    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(StatusCodes.OK).json({
        message: 'Người dùng chưa có đơn hàng nào.',
        data: {
          totalOrders: 0,
          completedOrders: '0/0 (0%)',
          canceledOrders: '0/0 (0%)',
          returnedOrders: '0/0 (0%)',
          compensationCost: 0,
        },
      });
    }

    const totalOrders = orders.length;

    // Tính toán các thông số
    const completedOrders = orders.filter(
      (order) => order.status === 'Đã nhận được hàng'
    ).length;
    const canceledOrders = orders.filter(
      (order) => order.status === 'Đã hủy'
    ).length;
    const returnedOrders = orders.filter(
      (order) => order.status === 'Hoàn đơn'
    ).length;

    const completedPercentage = ((completedOrders / totalOrders) * 100).toFixed(
      2
    );
    const canceledPercentage = ((canceledOrders / totalOrders) * 100).toFixed(
      2
    );
    const returnedPercentage = ((returnedOrders / totalOrders) * 100).toFixed(
      2
    );

    // Tính toán tiền bồi hoàn
    let compensationCost = 0;
    orders.forEach((order) => {
      if (order.status === 'Hoàn đơn' && order.paymentMethod === 'COD') {
        compensationCost += order.statusShip ? 30000 : 60000;
      }
    });

    // Kết quả trả về
    return res.status(200).json({
      message: 'Thống kê đơn hàng thành công',
      data: {
        totalOrders,
        completedOrders: `${completedOrders}/${totalOrders} (${completedPercentage}%)`,
        canceledOrders: `${canceledOrders}/${totalOrders} (${canceledPercentage}%)`,
        returnedOrders: `${returnedOrders}/${totalOrders} (${returnedPercentage}%)`,
        compensationCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleWarningUserAccount = catchAsync(async (req, res, next) => {
  //sendEmail
});

export const updatePaymentRestriction = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { restrictPayment } = req.body; // Giả sử body sẽ truyền true/false

  // Kiểm tra người dùng có tồn tại không
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );
  }

  // Cập nhật trạng thái 'paymentRestriction'
  user.paymentRestriction = restrictPayment;
  await user.save(); // Lưu thay đổi vào database

  const message = restrictPayment
    ? 'Đã yêu cầu người dùng thanh toán trước!'
    : 'Đã hủy yêu cầu thanh toán trước!';

  // Trả về kết quả
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: message,
  });
});

export const blockedUserAccBySuperAdmin = catchAsync(async (req, res, next) => {
  const idUser = req.params.idUser;
  const { status, note } = req.body;
  const user = await User.findOne({ _id: idUser });
  if (!user)
    return next(
      new AppError('Tài khoản không tồn tại !', StatusCodes.BAD_REQUEST)
    );

  if (status === false && note) {
    user.active = status;
    user.blockedDetail.blockReason = note;
    user.blockedDetail.handleBy = req.admin.fullName;

    await user.save();
    await sendMaiBlockedOrder(
      user.email,
      'Khoá tài khoản',
      user.fullName,
      note
    );
  } else {
    user.active = status;
    user.blockedDetail.blockReason = '';
    user.blockedDetail.handleBy = '';
    await user.save();
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật trạng thái thành công!',
  });
});

export const getAllAdminsAndSuperAdmins = catchAsync(async (req, res, next) => {
  const adminsAndSuperAdmins = await Admin.find();

  // Tách admin và superadmin từ danh sách
  const admins = adminsAndSuperAdmins.filter((user) => user.role === 'admin');
  const superAdmins = adminsAndSuperAdmins.filter(
    (user) => user.role === 'superadmin'
  );

  res.status(200).json({
    status: true,
    message: 'Thành công',
    admins: {
      data: admins,
    },
    superAdmins: {
      data: superAdmins,
    },
  });
});

export const blockedAccBySuperAdmin = catchAsync(async (req, res, next) => {
  const idAdmin = req.params.idAdmin;
  const { status } = req.body;
  const admin = await Admin.findOne({ _id: idAdmin });
  if (!admin)
    return next(
      new AppError('Tài khoản không tồn tại !', StatusCodes.BAD_REQUEST)
    );
  admin.active = status;
  await admin.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật trạng thái thành công!',
  });
});

export const updateAccountAdmin = catchAsync(async (req, res, next) => {
  const idAccount = req.params.idAdmin;

  const { resetPassword } = req.body;
  const admin = await Admin.findOne({ _id: idAccount });
  if (!admin)
    return next(
      new AppError('Tài khoản không tồn tại !', StatusCodes.BAD_REQUEST)
    );
  if (resetPassword) admin.password = resetPassword;

  await admin.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật thành công!',
  });
});

export const updatePasswordManagement = catchAsync(async (req, res, next) => {
  const { resetPassword } = req.body;
  const admin = await Admin.findOne({ _id: req.admin._id });
  if (!admin)
    return next(
      new AppError('Tài khoản không tồn tại !', StatusCodes.BAD_REQUEST)
    );
  if (resetPassword) admin.password = resetPassword;

  await admin.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật thành công!',
  });
});

export const getAdminById = catchAsync(async (req, res, next) => {
  const admin = await Admin.findOne({ _id: req.admin._id });
  if (!admin) return next(new AppError('Không tìm thấy tài khoản'));
  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Lấy thành công',
    data: admin,
  });
});

//lọc đơn hàng theo đơn hàng của khách hàng theo tuần
export const getOrdersByWeek = catchAsync(async (req, res, next) => {
  const idUser = req.user.id;
  const currentUser = req.user;

  // Xác định phạm vi thời gian trong tuần hiện tại
  const startDate = startOfWeek(new Date()); // Ngày đầu tuần
  const endDate = endOfWeek(new Date()); // Ngày cuối tuần

  // Lấy danh sách đơn hàng trong phạm vi tuần
  const orders = await Order.find({
    userId: idUser,
    createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo tuần
  })
    .select('code totalPrice createdAt status') // Chỉ lấy các trường cần thiết
    .lean();

  // Kiểm tra nếu không có đơn hàng
  if (!orders || orders.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Không tìm thấy đơn hàng nào trong tuần này.',
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

// lọc đơn hàng của khách theo tháng
export const getOrdersByMonth = catchAsync(async (req, res, next) => {
  const idUser = req.user.id;
  const currentUser = req.user;

  // Xác định phạm vi thời gian trong tháng hiện tại
  const startDate = startOfMonth(new Date()); // Ngày đầu tháng
  const endDate = endOfMonth(new Date()); // Ngày cuối tháng

  // Lấy danh sách đơn hàng trong phạm vi tháng
  const orders = await Order.find({
    userId: idUser,
    createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo tháng
  })
    .select('code totalPrice createdAt status') // Chỉ lấy các trường cần thiết
    .lean();

  // Kiểm tra nếu không có đơn hàng
  if (!orders || orders.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Không tìm thấy đơn hàng nào trong tháng này.',
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

export const getAllOrderByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const currentUser = await User.findById(userId);

  // Lấy danh sách đơn hàng của người dùng
  const orders = await Order.find({ userId: userId })
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

export const getAllOrderWithAccountAdmin = catchAsync(
  async (req, res, next) => {
    const idAdmin = req.admin.id;

    const orders = await Order.find({ assignedTo: idAdmin });
    if (!orders)
      return res.status(StatusCodes.OK).json({ status: true, data: null });
    return res.status(StatusCodes.OK).json({ status: true, data: orders });
  }
);
