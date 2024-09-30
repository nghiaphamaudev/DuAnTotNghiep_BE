import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import User from '../models/user.model';
import { StatusCodes } from 'http-status-codes';
import { registerSchema, loginSchema } from '../utils/userValidate.util';

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
    status: 'success',
    data: user,
    accessToken: token,
  });
};

//Register
export const Register = catchAsync(async (req, res, next) => {
  //Lấy dữ liệu từ form
  const { email, fullName, password, phoneNumber } = req.body;
  //Validate từ form
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  // Hiển thị lỗi
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  //Check email tồn tại
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return next(
      new AppError(
        'Email đã tồn tại, vui lòng sử dụng email khác!',
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const newUser = await User.create({ email, fullName, password, phoneNumber });
  createSendRes(newUser, StatusCodes.CREATED, res);
});

export const Login = catchAsync(async (req, res, next) => {
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
