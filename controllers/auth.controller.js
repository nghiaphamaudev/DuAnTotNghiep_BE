import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import User from '../models/user.model';
import { StatusCodes } from 'http-status-codes';
import { promisify } from 'util';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validator/user.validator';
import { sendMailServiceForgotPassword } from '../services/email.service';

//Hàm tạo token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Hàm gửi token và cookie
const createSendRes = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: true,
    data: user,
    accessToken: token,
    message: 'Thành công',
  });
};

//Register
export const register = catchAsync(async (req, res, next) => {
  //Lấy dữ liệu từ form
  const { email, fullName, password, phoneNumber } = req.body;
  //Validate từ form
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  // Hiển thị lỗi
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  // kiểm tra email đã tồn tại chưa
  const existedUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existedUser) {
    const conflictField =
      existedUser.email === email ? 'Email' : 'Số điện thoại';
    return next(
      new AppError(
        `${conflictField} đã được đăng ký, vui lòng sử dụng ${conflictField.toLowerCase()} khác!`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  await User.create({ email, fullName, password, phoneNumber });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Validate từ form
  const { error } = loginSchema.validate({ email }, { abortEarly: false });
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  //Tìm user với email
  const user = await User.findOne({ email }).select('+password');
  //Kiểm tra liệu user có tồn tại trong db hay không và check password
  if (!user || !(await user.checkPassword(password))) {
    return next(
      new AppError(
        'Email hoặc mật khẩu không chính xác!',
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  if (user.active === false)
    return next(
      new AppError(
        'Tài khoản của bạn đã bạn chặn, vui lòng liên hệ với quản trị viên!!',
        StatusCodes.FORBIDDEN
      )
    );
  createSendRes(user, StatusCodes.OK, res);
});

// Kiểm tra token từ header hoặc cookie.
// Giải mã token và kiểm tra người dùng tương ứng có tồn tại không.
// Kiểm tra xem mật khẩu của người dùng có thay đổi sau khi token được phát hành không.
// Nếu mọi thứ hợp lệ, nó cho phép tiếp tục xử lý yêu cầu.
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        'Bạn chưa đăng nhập, vui lòng đăng nhập để tiếp tục',
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  // Kiểm tra trong trường hợp người dùng này đã bị xóa  nhưng vẫn có token để đăng nhập
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User này không tồn tại', StatusCodes.UNAUTHORIZED)
    );
  }
  //Kiểm tra User đã thay đổi mật khẩu n
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Tài khoản đã thay đổi mật khẩu! Vui lòng đăng nhập lại',
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  req.user = currentUser;
  req.user.id = decoded.id;
  next();
});

//Hạn chế quyền
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

//Validate email nhập bởi user
//Tìm email user có tồn tại chưa
//Tạo resetToken và gửi cho user , băm resetToken lưu vào db
//Gửi đường dẫn qua email
export const forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get User based on posted email
  const { email } = req.body;

  //Validate từ form
  const { error } = forgotPasswordSchema.validate(
    { email },
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('Email không tồn tại', StatusCodes.NOT_FOUND));
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Sent it to email
  const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;
  try {
    await sendMailServiceForgotPassword(
      user.email,
      'Đặt lại mật khẩu (có hiệu lực trong 10 phút)',
      resetURL
    );

    res.status(StatusCodes.OK).json({
      status: true,
      message: 'Token đặt lại mật khẩu đã được gửi đến email của bạn!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau!',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  //Validate password, passwordConfirm
  const { password, passwordConfirm } = req.body;
  const { error } = resetPasswordSchema.validate(
    { password, passwordConfirm },
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  //Băm lại token và so sánh với token trong db
  //Kiểm tra thời hạn của resetToken
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new AppError(
        'Mã xác thực không hợp lệ hoặc đã hết hạn!',
        StatusCodes.BAD_REQUEST
      )
    );

  //Đổi mật khẩu và lưu lại thời gian thay đổi mật khẩu
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  createSendRes(user, StatusCodes.OK, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;
  const { error } = resetPasswordSchema.validate(
    { passwordCurrent, passwordConfirm ,password},
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  //Lấy thong tin người dùng qua protect
  const currentUser = await User.findById(req.user.id).select('+password');
  if (!currentUser)
    return next(
      new AppError('Tài khoản không tồn tại ', StatusCodes.BAD_REQUEST)
    );
  //2) Check password hiện tại
  if (!(await currentUser.checkPassword(passwordCurrent)))
    return next(
      new AppError('Mật khẩu hiện tại không đúng', StatusCodes.UNAUTHORIZED)
    );
  //Check password có giống vơi mật khẩu cũ không
  if (password === passwordCurrent) {
    return next(
      new AppError(
        'Mật khẩu đã từng tồn tại. Vui lòng dùng mật khẩu khác!',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  //Cập nhật new password
  currentUser.password = password;
  await currentUser.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: "Cập nhật thành công!",
    data:null
  })
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ status: 'true' });
};
