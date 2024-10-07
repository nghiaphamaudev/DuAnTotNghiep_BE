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

export const addAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  let isDefault = false;
  const { name, phone, address } = req.body;
  if (currentUser.addresses.length === 0) {
    isDefault = true;
  }

  const newAddress = [
    ...currentUser.addresses,
    { name, phone, address, isDefault },
  ];
  //Add new address
  const addresses = await User.findByIdAndUpdate(
    currentUser._id,
    { addresses: newAddress },
    {
      new: true,
    }
  );
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: addresses,
  });
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idAddress = req.params.addressId;
  const { name, phone, address } = req.body;

  // tìm và cập nhật địa chỉ
  const updatedAddresses = currentUser.addresses.map((addr) =>
    addr._id.toString() === idAddress
      ? { ...addr.toObject(), name, phone, address }
      : addr
  );

  const user = await User.findByIdAndUpdate(
    currentUser._id,
    { addresses: updatedAddresses },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: user.addresses,
  });
});

export const updateStatusAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idAddressUpdate = req.params.addressId;

  // Tìm và đặt isDefault thành false cho địa chỉ hiện tại đang là mặc định
  const currentDefaultAddress = currentUser.addresses.find(
    (address) => address.isDefault === true
  );

  //set isDefault cho address ti thay la false mang hien tai se la false
  //Tat ca dang thao tac vo mang
  if (currentDefaultAddress) {
    currentDefaultAddress.isDefault = false;
  }

  // Tìm địa chỉ được truyền qua param và đặt isDefault thành true
  const addressToUpdate = currentUser.addresses.find(
    (address) => address._id.toString() === idAddressUpdate
  );

  if (!addressToUpdate) {
    return next(new AppError('Address not found', 404));
  }
  addressToUpdate.isDefault = true;

  currentUser.addresses.sort((a, b) => b.isDefault - a.isDefault);

  // Cập nhật user với danh sách địa chỉ mới
  await User.findByIdAndUpdate(currentUser._id, {
    addresses: currentUser.addresses,
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: currentUser.addresses,
  });
});

export const deleteAddress = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Lấy ID người dùng từ xác thực (JWT)
  const addressId = req.params.addressId; // Lấy ID địa chỉ từ URL

  // Tìm người dùng và xóa địa chỉ theo ID
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Người dùng không tồn tại' });
  }

  // Lọc ra danh sách địa chỉ mà không chứa địa chỉ cần xóa
  user.addresses = user.addresses.filter(
    (address) => address._id.toString() !== addressId
  );

  // Lưu lại thông tin người dùng sau khi xóa địa chỉ
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ message: 'Xóa địa chỉ thành công', addresses: user.addresses });
});

export const addFavoriteProduct = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idFavoriteProduct = req.params.id;
  const currentArrayFavoriteProduct = currentUser.favoriteProduct;

  const isExsitedIdFavoriteProduct = currentArrayFavoriteProduct.find(
    (el) => el.product == idFavoriteProduct
  );
  if (isExsitedIdFavoriteProduct)
    return res.status(StatusCodes.OK).json({
      status: 'success',
    });

  const favoriteProduct = await User.findByIdAndUpdate(
    currentUser._id,
    { $push: { favoriteProduct: { product: idFavoriteProduct } } },
    { new: true, runValidators: true }
  );

  //Add new address

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: favoriteProduct,
  });
});

export const removeFavoriteProduct = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idFavoriteProduct = req.params.id;

  // Remove product from favoriteProduct array
  const updatedUser = await User.findByIdAndUpdate(
    currentUser._id,
    { $pull: { favoriteProduct: { product: idFavoriteProduct } } },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: updatedUser,
  });
});
