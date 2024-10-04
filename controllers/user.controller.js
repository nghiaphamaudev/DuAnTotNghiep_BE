import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import User from '../models/user.model';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../configs/cloudiary.config';
import { updateMeSchema } from '../validator/user.validator';

// Check lại mật khẩu user nhập vào có đúng mới xóa
export const deleteMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { password } = req.body;
  const currentUser = await User.findById(userId).select('+password');
  if (!currentUser || !(await currentUser.checkPassword(password))) {
    return next(
      new AppError('Mật khẩu không chính xác', StatusCodes.UNAUTHORIZED)
    );
  }
  await User.findByIdAndUpdate(userId, { active: false });
  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

//Lọc ra các trường mình muốn cập nhật
const filterObj = (obj, ...allowedFiels) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFiels.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  // req.file.path = https://res.cloudinary.com/dyv5zfnit/image/upload/v1728037423/users/5270ef936a2391329b3f3c0ee37b8f1190b06aae01d203640072aa1285540132.jpg

  const { phoneNumber, fullName } = req.body;
  //Validate từ form
  const { error } = updateMeSchema.validate(
    { phoneNumber, fullName },
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        ' Không cho phép cập nhật mật khẩu. Vui lòng thử với chức năng cập nhật mật khẩu!',
        StatusCodes.NOT_FOUND
      )
    );
  }
  const filtedBody = filterObj(req.body, 'phoneNumber', 'fullName', 'avatar');
  const userCurrent = await User.findById(req.user.id);
  if (!userCurrent) {
    return next(
      new AppError('Người dùng không tồn tại', StatusCodes.UNAUTHORIZED)
    );
  }
  if (
    req.file &&
    userCurrent.avatar !==
      'https://res.cloudinary.com/dyv5zfnit/image/upload/v1727975620/users/user_default.jpg'
  ) {
    const userIdHashed = crypto
      .createHash('sha256')
      .update(req.user.id)
      .digest('hex');

    try {
      await cloudinary.uploader.destroy(userIdHashed);
    } catch (error) {
      return next(
        new AppError('Không thể xóa ảnh', StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }
    filtedBody.avatar = req.file.path;
  } else {
    filtedBody.avatar = userCurrent.avatar;
  }

  const updated = await User.findByIdAndUpdate(req.user.id, filtedBody, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: updated,
    },
  });
});
