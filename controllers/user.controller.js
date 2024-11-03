import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import User from '../models/user.model';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../configs/cloudiary.config';
import { updateMeSchema, addAddressSchema } from '../validator/user.validator';

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
  req.params.userId = req.user.id;
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

  const { phoneNumber, fullName, gender } = req.body;
  //Validate từ form
  const { error } = updateMeSchema.validate(
    { phoneNumber, fullName, gender },
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
  const filtedBody = filterObj(
    req.body,
    'phoneNumber',
    'fullName',
    'avatar',
    'gender'
  );
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
  const {
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
  } = req.body;

  // Validate dữ liệu từ form
  const { error } = addAddressSchema.validate(
    {
      nameReceiver,
      phoneNumberReceiver,
      addressReceiver,
      detailAddressReceiver,
    },
    { abortEarly: false }
  );

  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  // Kiểm tra xem địa chỉ mới có phải là địa chỉ mặc định không
  const isDefault = currentUser.addresses.length === 0;

  // Tạo địa chỉ mới
  const newAddress = {
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
    isDefault,
  };

  // Nếu địa chỉ mới là mặc định, bỏ dấu mặc định của các địa chỉ cũ
  if (isDefault) {
    currentUser.addresses.forEach((address) => (address.isDefault = false));
  }

  // Thêm địa chỉ mới vào danh sách
  currentUser.addresses.push(newAddress);

  // Lưu thay đổi vào database
  await currentUser.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: currentUser.addresses,
  });
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idAddress = req.params.addressId;
  console.log(idAddress);
  const {
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
  } = req.body;

  console.log(req.body);

  // Validate dữ liệu từ request body
  const { error } = addAddressSchema.validate(
    {
      nameReceiver,
      phoneNumberReceiver,
      addressReceiver,
      detailAddressReceiver,
    },
    { abortEarly: false }
  );

  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  // Tìm địa chỉ cần cập nhật
  const addressIndex = currentUser.addresses.findIndex(
    (addr) => addr._id.toString() === idAddress
  );

  if (addressIndex === -1) {
    return next(new AppError('Địa chỉ không tồn tại', StatusCodes.NOT_FOUND));
  }

  // Cập nhật địa chỉ
  currentUser.addresses[addressIndex] = {
    _id: currentUser.addresses[addressIndex]._id, // Giữ lại _id
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
    isDefault: currentUser.addresses[addressIndex].isDefault,
  };

  // Lưu thay đổi vào database
  await currentUser.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: currentUser.addresses,
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

  // Kiểm tra xem địa chỉ có tồn tại trong danh sách của người dùng không
  const addressExists = user.addresses.some(
    (address) => address._id.toString() === addressId
  );

  if (!addressExists) {
    return next(new AppError('Địa chỉ không tồn tại!', StatusCodes.NOT_FOUND));
  }

  // Lọc ra các địa chỉ không phải là địa chỉ cần xóa
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

export const getAllUser = catchAsync(async (req, res, next) => {
  // Lấy số trang và số bản ghi trên mỗi trang từ query params
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = 6; // Số bản ghi trên mỗi trang
  const skip = (page - 1) * limit;

  // Tìm tất cả người dùng với giới hạn và phân trang
  const users = await User.find().skip(skip).limit(limit);

  // Đếm tổng số người dùng để trả về tổng số trang
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        totalUsers,
      },
    },
  });
});

import axios from 'axios';

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user)
    return next(new AppError('User không tồn tại!', StatusCodes.NOT_FOUND));

  // Tách thông tin chung của người dùng
  const userInfo = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    role: user.role,
    rank: user.rank,
    gender: user.gender,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // Lấy danh sách địa chỉ và gọi API để lấy thông tin chi tiết
  const addresses = await Promise.all(
    user.addresses.map(async (address) => {
      try {
        const [provinceResponse, districtResponse, wardResponse] =
          await Promise.all([
            axios.get(
              `https://provinces.open-api.vn/api/p/${address.addressReceiver.province.code}`
            ),
            axios.get(
              `https://provinces.open-api.vn/api/d/${address.addressReceiver.district.code}`
            ),
            axios.get(
              `https://provinces.open-api.vn/api/w/${address.addressReceiver.ward.code}`
            ),
          ]);

        return {
          nameReceiver: address.nameReceiver,
          phoneNumberReceiver: address.phoneNumberReceiver,
          detailAddressReceiver: address.detailAddressReceiver,
          isDefault: address.isDefault,
          addressReceiver: {
            province: {
              provinceCode: address.addressReceiver.province.code,
              provinceName: provinceResponse.data.name,
            },
            district: {
              districtCode: address.addressReceiver.district.code,
              districtName: districtResponse.data.name,
            },
            ward: {
              wardCode: address.addressReceiver.ward.code,
              wardName: wardResponse.data.name,
            },
          },
          _id: address._id,
          id: address.id,
        };
      } catch (error) {
        return next(
          new AppError(
            'Lỗi khi gọi API địa chỉ',
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      }
    })
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      userInfo,
      addresses,
    },
  });
});

export const toggleBlockUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const { shouldBlock } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );
  }

  await user.toggleBlockUser(shouldBlock);

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: shouldBlock
      ? 'Người dùng đã bị chặn thành công'
      : 'Người dùng đã được bỏ chặn thành công',
    data: user,
  });
});

export const changeUserRole = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );
  }

  // Chuyển đổi vai trò người dùng
  user.role = user.role === 'admin' ? 'user' : 'admin';
  await user.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: `Vai trò người dùng đã được thay đổi thành công thành ${user.role}`,
    data: user,
  });
});

export const deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );
  }
  res.status(StatusCodes.OK).json({ status: 'success' });
});
