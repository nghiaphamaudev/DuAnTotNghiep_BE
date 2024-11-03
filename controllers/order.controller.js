import Product from '../models/product.model';
import Cart from '../models/cart.model';
import Order from '../models/order.model';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import { checkAddressOrderSchema } from '../validator/user.validator';
import { uploadProductImages } from '../middlewares/uploadCloud.middleware';

export const createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Lấy ID người dùng từ token
  const { productSelectedIds, ...bodyData } = req.body; // Tách sản phẩm đã chọn và dữ liệu còn lại
  const { receiver, phoneNumber, address, paymentMethod, discountCode } =
    bodyData;

  // Kiểm tra tính hợp lệ của địa chỉ
  const { error } = checkAddressOrderSchema.validate(
    { receiver, phoneNumber, address },
    { abortEarly: false }
  );

  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }


});
