import { StatusCodes } from 'http-status-codes';
import Admin from '../models/admin.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const checkAdminRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new AppError(
          'Bạn không có quyền thực hiện hành động này!',
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Bạn không có quyền thực hiện hành động này!',
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};

export const protectAdmin = catchAsync(async (req, res, next) => {
  let token;

  // Lấy token từ header hoặc cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.adminJwt) {
    token = req.cookies.adminJwt;
  }

  // Nếu không tìm thấy token
  if (!token) {
    return next(
      new AppError(
        'Bạn chưa đăng nhập với quyền admin, vui lòng đăng nhập để tiếp tục',
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // Giải mã token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_ADMIN
  );

  // Kiểm tra xem admin có tồn tại không
  const currentAdmin = await Admin.findById(decoded.id);

  if (!currentAdmin) {
    return next(
      new AppError(
        'Admin không tồn tại hoặc đã bị xóa',
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // Kiểm tra nếu tài khoản admin bị vô hiệu hóa
  if (!currentAdmin.active) {
    return next(
      new AppError(
        'Tài khoản admin của bạn đã bị vô hiệu hóa. Vui lòng liên hệ superadmin',
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // Gắn thông tin admin vào request để sử dụng sau
  req.admin = currentAdmin;

  next();
});
