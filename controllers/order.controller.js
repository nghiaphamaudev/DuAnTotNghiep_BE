import Product from '../models/product.model';
import Cart from '../models/cart.model';
import Order from '../models/order.model';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import { checkAddressOrderSchema } from '../validator/user.validator';
import { uploadProductImages } from '../middlewares/uploadCloud.middleware';

function calculateTotalPrice(items) {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

const updateCartAfterOrder = async (userId, orderItems) => {
  try {
    await Cart.updateOne(
      { userId },
      {
        $pull: {
          items: {
            $or: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              sizeId: item.sizeId,
            })),
          },
        },
      }
    );
    console.log('Cập nhật giỏ hàng thành công sau khi đặt hàng!');
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
  }
};

export const createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Lấy ID người dùng từ token
  const cart = req.currentCart;

  const { orderItems, ...bodyData } = req.body; // Tách sản phẩm đã chọn và dữ liệu còn lại
  const {
    receiver,
    phoneNumber,
    address,
    paymentMethod,
    discountCode,
    discountVoucher,
    shippingCost,
  } = bodyData;

  // Kiểm tra tính hợp lệ của địa chỉ
  const { error } = checkAddressOrderSchema.validate(
    { receiver, phoneNumber, address },
    { abortEarly: false }
  );
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }
  const code = `FS${dayjs().format('YYYYMMDDHHmmss')}`;
  const totalPrice = calculateTotalPrice(orderItems);

  const order = new Order({
    userId,
    code,
    orderItems,
    totalPrice,
    receiver,
    phoneNumber,
    address,
    paymentMethod,
    discountCode,
    shippingCost,
    discountVoucher,
  });
  await order.save();
  updateCartAfterOrder(userId, orderItems);
  if (paymentMethod === "VNPAY") {

  }
    return res.status(200).json({
      message: 'Thành công',
      data: order,
    });
});
