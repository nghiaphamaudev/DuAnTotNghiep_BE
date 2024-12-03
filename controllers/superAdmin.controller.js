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

  res.status(200).json({
    status: true,
    message: 'Thành công',
    data: {
      list: users,
      pagination: {
        currentPage: page,
        totalPages: userPages,
        limit,
        totalUsers,
      },
    },
  });
});

export const getAllAdminsAndSuperAdmins = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;

  const skip = (page - 1) * limit;

  // Lấy danh sách admin và superadmin
  const adminsAndSuperAdmins = await Admin.find().skip(skip).limit(limit);

  // Đếm tổng số admin và superadmin (trừ người dùng hiện tại)
  const totalAdminsAndSuperAdmins = await Admin.countDocuments();

  // Tính tổng số trang
  const totalPages = Math.ceil(totalAdminsAndSuperAdmins / limit);

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
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        totalUsers: admins.length,
      },
    },
    superAdmins: {
      data: superAdmins,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        totalUsers: superAdmins.length,
      },
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
    user.blockReason = note;
    await user.save();
    await sendMaiBlockedOrder(
      user.email,
      'Khoá tài khoản',
      user.fullName,
      note
    );
  } else {
    user.active = status;
    user.blockReason = '';
    await user.save();
  }

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
