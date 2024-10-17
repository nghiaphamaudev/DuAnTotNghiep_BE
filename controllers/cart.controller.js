import Cart from "../models/cart.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import AppError from "../utils/appError.util";
import catchAsync from "../utils/catchAsync.util";
import { StatusCodes } from "http-status-codes";



export const addItemToCart = catchAsync(async (req, res, next) => {
    const { userId, productId, variantId, sizeId, quantity } = req.body;

    // Lấy sản phẩm dựa trên productId
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

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

    // Kiểm tra nếu sản phẩm và size đã tồn tại trong giỏ hàng của người dùng
    let cartItem = await Cart.findOne({ userId, productId, variantId, sizeId });

    if (cartItem) {
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        cartItem.quantity += quantity || 1;
        await cartItem.save();
    } else {
        // Nếu sản phẩm chưa có, tạo mới
        cartItem = await Cart.create({
            userId,
            productId,
            variantId,
            sizeId,
            quantity: quantity || 1,
        });
    }

    res.status(201).json({
        status: 'success',
        userId: cartItem.userId,
        cartItem: {
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            sizeId: cartItem.sizeId,
            quantity: cartItem.quantity,
            createdAt: cartItem.createdAt,
            updatedAt: cartItem.updatedAt
        }
    });
});


export const getUserCart = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    // Tìm giỏ hàng của người dùng
    const cartItems = await Cart.find({ userId });

    // Kiểm tra nếu không tìm thấy item nào trong giỏ hàng
    if (!cartItems || cartItems.length === 0) {
        return next(new AppError('No items found in the cart!', 404));
    }

    // Trả về userId và danh sách sản phẩm trong giỏ hàng
    res.status(200).json({
        status: 'success',
        userId: userId, // Trả về userId từ params
        cartItems: cartItems.map(item => ({
            _id: item._id,
            productId: item.productId,
            variantId: item.variantId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        })),
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
        cart: updatedCart
    });
});

export const updateProductQuantity = catchAsync(async (req, res, next) => {
    const { userId, cartItemId, quantity } = req.body;

    // Tìm giỏ hàng của người dùng dựa trên userId
    const cartItem = await Cart.findById(cartItemId);

    // Kiểm tra nếu không tìm thấy mục giỏ hàng
    if (!cartItem || cartItem.userId.toString() !== userId) {
        return next(new AppError('Cart item not found or user not authorized', 404));
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
            updatedAt: cartItem.updatedAt
        }
    });
});

export const increaseProductQuantity = catchAsync(async (req, res, next) => {
    const { userId, cartItemId } = req.body;

    const cartItem = await Cart.findById(cartItemId);

    if (!cartItem || cartItem.userId.toString() !== userId) {
        return next(new AppError('Cart item not found or user not authorized', 404));
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
            updatedAt: cartItem.updatedAt
        }
    });
});

export const decreaseProductQuantity = catchAsync(async (req, res, next) => {
    const { userId, cartItemId } = req.body;

    // Tìm mục giỏ hàng dựa trên cartItemId
    const cartItem = await Cart.findById(cartItemId);

    // Kiểm tra nếu không tìm thấy mục giỏ hàng hoặc người dùng không được ủy quyền
    if (!cartItem || cartItem.userId.toString() !== userId) {
        return next(new AppError('Cart item not found or user not authorized', 404));
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
            updatedAt: cartItem.updatedAt
        }
    });
});





