import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import User from '../models/user.model';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../configs/cloudiary.config';
import { updateMeSchema, addAddressSchema } from '../validator/user.validator';

import axios from 'axios';
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
    status: true,
    message: 'Thành công',
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
  const { phoneNumber, fullName, gender } = req.body;

  // Validate từ form
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
        'Không cho phép cập nhật mật khẩu. Vui lòng thử với chức năng cập nhật mật khẩu!',
        StatusCodes.NOT_FOUND
      )
    );
  }

  if (req.file) {
    req.body.avatar = req.file.path;
  }
  const filtedBody = filterObj(
    req.body,
    'phoneNumber',
    'fullName',
    'avatar',
    'gender'
  );
  const userCurrent = await User.findById(req.user.id);

  // Kiểm tra xem người dùng có tồn tại không
  if (!userCurrent) {
    return next(
      new AppError('Người dùng không tồn tại', StatusCodes.UNAUTHORIZED)
    );
  }

  // Kiểm tra xem số điện thoại đã tồn tại trong database (ngoại trừ người dùng hiện tại)
  const existedPhone = await User.findOne({
    phoneNumber: phoneNumber,
    _id: { $ne: req.user.id },
  });
  if (existedPhone) {
    return next(
      new AppError(
        'Số điện thoại này đã được sử dụng bởi tài khoản khác',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Cập nhật thông tin người dùng
  const updated = await User.findByIdAndUpdate(req.user.id, filtedBody, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
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
    isDefault,
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

  // Nếu `isDefault` là true, đặt các địa chỉ khác thành false
  if (isDefault) {
    currentUser.addresses.forEach((address) => (address.isDefault = false));
  }

  // Tạo địa chỉ mới
  const newAddress = {
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
    isDefault: isDefault || currentUser.addresses.length === 0, // Địa chỉ đầu tiên luôn là mặc định
  };

  // Thêm địa chỉ mới vào danh sách
  currentUser.addresses.push(newAddress);

  // Lưu thay đổi vào database
  await currentUser.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
    data: currentUser.addresses,
  });
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user; // Lấy thông tin người dùng
  const idAddress = req.params.addressId;

  const {
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
    isDefault, // Nhận thêm giá trị isDefault từ body
  } = req.body;

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

  // Nếu địa chỉ đang được đặt là mặc định
  if (isDefault) {
    // Đặt tất cả các địa chỉ khác về không mặc định
    currentUser.addresses.forEach((address, index) => {
      if (index !== addressIndex) {
        address.isDefault = false;
      }
    });
  }

  // Cập nhật địa chỉ hiện tại
  currentUser.addresses[addressIndex] = {
    _id: currentUser.addresses[addressIndex]._id, // Giữ lại _id
    nameReceiver,
    phoneNumberReceiver,
    addressReceiver,
    detailAddressReceiver,
    isDefault: isDefault || false, // Nếu không có isDefault thì giữ nguyên trạng thái
  };

  // Lưu thay đổi vào database
  await currentUser.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
    data: currentUser.addresses,
  });
});

export const updateStatusAddress = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const idAddressUpdate = req.params.addressId;

  // Tìm địa chỉ cần cập nhật
  const addressToUpdate = currentUser.addresses.find(
    (address) => address._id.toString() === idAddressUpdate
  );

  if (!addressToUpdate) {
    return next(new AppError('Address not found', 404));
  }

  // Đặt tất cả các địa chỉ isDefault thành false
  currentUser.addresses.forEach((address) => {
    address.isDefault = false;
  });

  // Đặt địa chỉ được chọn thành true
  addressToUpdate.isDefault = true;

  // Cập nhật user với danh sách địa chỉ mới
  await User.findByIdAndUpdate(
    currentUser._id,
    { addresses: currentUser.addresses },
    { new: true } // Trả về dữ liệu mới nhất sau khi cập nhật
  );

  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
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
      status: true,
      message: 'Thành công',
    });

  const favoriteProduct = await User.findByIdAndUpdate(
    currentUser._id,
    { $push: { favoriteProduct: { product: idFavoriteProduct } } },
    { new: true, runValidators: true }
  );

  //Add new address

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
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
    status: true,
    message: 'Thành công',
    data: updatedUser,
  });
});

export const getAllUser = catchAsync(async (req, res, next) => {
  // Lấy id user hiện tại từ req.user (middleware xác thực)
  const currentUserId = req.user.id;

  // Lấy số trang và số bản ghi trên mỗi trang từ query params
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = 6; // Số bản ghi trên mỗi trang
  const skip = (page - 1) * limit;

  // Tìm tất cả người dùng ngoại trừ user hiện tại và có role là admin
  const users = await User.find({
    _id: { $ne: currentUserId },
    role: { $ne: 'admin' },
  })
    .skip(skip)
    .limit(limit);

  // Đếm tổng số người dùng (ngoại trừ user hiện tại và admin) để tính tổng số trang
  const totalUsers = await User.countDocuments({
    _id: { $ne: currentUserId },
    role: { $ne: 'admin' },
  });
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    status: true,
    message: 'Thành công',
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

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user)
    return next(new AppError('User không tồn tại!', StatusCodes.NOT_FOUND));

  // Tách thông tin chung của người dùng

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
              code: address.addressReceiver.province.code,
              name: provinceResponse.data.name,
            },
            district: {
              code: address.addressReceiver.district.code,
              name: districtResponse.data.name,
            },
            ward: {
              code: address.addressReceiver.ward.code,
              name: wardResponse.data.name,
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
    status: true,
    message: 'Thành công',
    data: {
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
      addresses,
    },
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
