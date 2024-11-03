import Cart from '../models/cart.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import { StatusCodes } from 'http-status-codes';

export const addItemToCart = catchAsync(async (req, res, next) => {
  const { userId, productId, variantId, sizeId, quantity } = req.body;
  // Lấy sản phẩm dựa trên productId
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  console.log(product);

  // Lấy biến thể (variant) của sản phẩm
  const variant = product.variants.id(variantId);
  if (!variant) {
    return next(new AppError('Variant not found', 404));
  }

  // Kiểm tra sizeId có tồn tại trong biến thể không
  const size = variant.sizes.id(sizeId);
  if (!size) {
    return next(new AppError('Size not found', 404));
  }

  // Lấy ảnh đầu tiên của biến thể
  const variantImage = variant.images?.[0] || null;

  // Tìm giỏ hàng của người dùng
  let cart = await Cart.findOne({ userId });

  if (cart) {
    // Kiểm tra xem sản phẩm với variantId và sizeId có trong giỏ hàng chưa
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId === variantId &&
        item.sizeId === sizeId
    );

    if (existingItem) {
      // Nếu có, cập nhật số lượng
      existingItem.quantity += quantity || 1;
    } else {
      // Nếu chưa có, thêm sản phẩm vào giỏ hàng
      cart.items.push({
        productId,
        colorId: variantId,
        sizeId,
        quantity: quantity || 1,
      });
    }
  } else {
    // Nếu chưa có giỏ hàng, tạo giỏ hàng mới
    cart = await Cart.create({
      userId,
      items: [
        {
          productId,
          colorId: variantId,
          sizeId,
          quantity: quantity || 1,
        },
      ],
    });
  }

  await cart.save();

  res.status(201).json({
    status: 'success',
    data: {
      userId: cart.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.colorId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        image: variantImage,
      })),
      total: cart.total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    },
  });
});

export const getCartDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // lấy userId từ request hoặc từ token
  console.log(userId);
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name coverImg variants',
  });

  if (!cart) return next(new AppError('Cart not found', 404));

  const cartDetails = await Promise.all(
    cart.items.map(async (item) => {
      const product = item.productId;
      const variant = product.variants.find(
        (v) => v._id.toString() === item.colorId // Nên sử dụng item.variantId
      );
      const size = variant.sizes.find((s) => s._id.toString() === item.sizeId);

      return {
        productId: product._id,
        name: product.name,

        color: variant.color,
        images: variant.images[0],
        size: size.nameSize,
        price: size.price,
        quantity: item.quantity,
        totalItemPrice: size.price * item.quantity,
        variantId: variant._id, // Thêm variantId
        sizeId: size._id, // Thêm sizeId
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      userId: cart.userId,
      items: cartDetails,
      total: cart.total,
    },
  });
});

export const removeCartItem = catchAsync(async (req, res, next) => {
  const { userId, cartItemId } = req.body;

  const cartItem = await Cart.findByIdAndDelete(cartItemId);

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  const updatedCart = await Cart.findOne({ userId });

  res.status(200).json({
    status: 'success',
    message: 'Cart item removed successfully',
    cart: updatedCart,
  });
});

export const updateProductQuantity = catchAsync(async (req, res, next) => {
  const { userId, cartItemId, quantity } = req.body;

  // Tìm giỏ hàng của người dùng dựa trên userId
  const cartItem = await Cart.findById(cartItemId);

  // Kiểm tra nếu không tìm thấy mục giỏ hàng
  if (!cartItem || cartItem.userId.toString() !== userId) {
    return next(
      new AppError('Cart item not found or user not authorized', 404)
    );
  }

  // Cập nhật số lượng sản phẩm
  cartItem.quantity = quantity;

  // Lưu giỏ hàng đã cập nhật
  await cartItem.save();

  // Trả về mục giỏ hàng đã cập nhật
  res.status(200).json({
    status: 'success',
    cartItem: {
      _id: cartItem._id,
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      sizeId: cartItem.sizeId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    },
  });
});

export const increaseProductQuantity = catchAsync(async (req, res, next) => {
  const { userId, cartItemId } = req.body;

  const cartItem = await Cart.findById(cartItemId);

  if (!cartItem || cartItem.userId.toString() !== userId) {
    return next(
      new AppError('Cart item not found or user not authorized', 404)
    );
  }

  // Tăng số lượng sản phẩm
  cartItem.quantity++;

  // Lưu giỏ hàng đã cập nhật
  await cartItem.save();

  // Trả về mục giỏ hàng đã cập nhật
  res.status(StatusCodes.OK).json({
    status: 'success',
    cartItem: {
      _id: cartItem._id,
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      sizeId: cartItem.sizeId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    },
  });
});

export const decreaseProductQuantity = catchAsync(async (req, res, next) => {
  const { userId, cartItemId } = req.body;

  // Tìm mục giỏ hàng dựa trên cartItemId
  const cartItem = await Cart.findById(cartItemId);

  // Kiểm tra nếu không tìm thấy mục giỏ hàng hoặc người dùng không được ủy quyền
  if (!cartItem || cartItem.userId.toString() !== userId) {
    return next(
      new AppError('Cart item not found or user not authorized', 404)
    );
  }

  // Giảm số lượng sản phẩm
  if (cartItem.quantity > 1) {
    cartItem.quantity--;
  } else {
    return next(new AppError('Cannot decrease quantity below 1', 400)); // Nếu số lượng đã bằng 1 thì không giảm xuống
  }

  // Lưu giỏ hàng đã cập nhật
  await cartItem.save();

  // Trả về mục giỏ hàng đã cập nhật
  res.status(StatusCodes.OK).json({
    status: 'success',
    cartItem: {
      _id: cartItem._id,
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      sizeId: cartItem.sizeId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    },
  });
});
