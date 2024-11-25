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

//tạo storage cho feedback
const feedbackStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'feedbacks', // Thư mục cho feedback
    format: 'jpg', // Định dạng ảnh
    public_id: () => uuidv4(), // Tạo public_id ngẫu nhiên
  },
});

// Middleware cho feedback, cho phép upload tối đa 4 ảnh
const uploadFeedbackCloud = multer({ storage: feedbackStorage }).fields([
  { name: 'images', maxCount: 4 }, // Tối đa 4 ảnh cho feedback
]);

// Middleware cho product, cho phép upload tối đa 4 ảnh

// Middleware cho product, cho phép upload tối đa 4 ảnh cho mỗi trường images và imageFiles

const uploadProductCloud = multer({ storage: productStorage }).fields([
  { name: 'coverImage', maxCount: 1 },
  ...Array.from({ length: 10 }, (_, index) => [
    { name: `variants[${index}][images]`, maxCount: 4 },
    { name: `variants[${index}][imageFiles]`, maxCount: 4 },
  ]).flat(),
]);

// Middleware cho user, chỉ cho phép upload 1 ảnh
const uploadUserCloud = multer({ storage: userStorage }).single('image');

export const cloudinaryDelete = async (imageUrls) => {
  try {
    // Lọc ra các public_id từ URL ảnh
    const publicIds = imageUrls.map((url) => {
      const parts = url.split('/');
      return parts[parts.length - 1].split('.')[0]; // Lấy phần public_id
    });

    // Xóa ảnh từ Cloudinary (xử lý hàng loạt)
    if (publicIds.length > 0) {
      await cloudinary.v2.api.delete_resources(publicIds);
    }

    console.log('Ảnh đã được xóa thành công');
  } catch (error) {
    console.error('Lỗi khi xóa ảnh:', error);
  }
};

// Xuất middleware
export const uploadUserImage = uploadUserCloud;
export const uploadProductImages = uploadProductCloud;
export const uploadFeedbackImages = uploadFeedbackCloud;
