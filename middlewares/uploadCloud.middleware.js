import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../configs/cloudiary.config';
dotenv.config();

// Tạo storage cho User (chỉ cho phép upload 1 ảnh)
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    const userId = req.user.id;
    const userIdHashed = crypto
      .createHash('sha256')
      .update(userId)
      .digest('hex');

    return {
      folder: `users`, // Sử dụng folder theo ID user
      format: 'jpg', // Định dạng ảnh
      public_id: `${userIdHashed}`, // Tạo public_id ngắn gọn
    };
  },
});



// Tạo storage cho Product (cho phép upload tối đa 4 ảnh)
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'products',
    format: 'jpg', // Có thể chọn định dạng khác như png
    public_id: () => uuidv4(),
  },
});



// Middleware cho product, cho phép upload tối đa 4 ảnh
const uploadProductCloud = multer({ storage: productStorage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'variants[0][images]', maxCount: 4 }, // 4 ảnh cho biến thể đầu tiên
  { name: 'variants[1][images]', maxCount: 4 }, // 4 ảnh cho biến thể thứ hai
]);

// Middleware cho user, chỉ cho phép upload 1 ảnh
const uploadUserCloud = multer({ storage: userStorage }).single('image');

// Xuất middleware
export const uploadUserImage = uploadUserCloud;
export const uploadProductImages = uploadProductCloud;
