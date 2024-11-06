import Cart from '../models/cart.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import { StatusCodes } from 'http-status-codes';

export const addItemToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, variantId, sizeId, quantity } = req.body;
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

export const getCartByUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const currentCartUser = await Cart.findOne({ userId });

  req.currentCart = currentCartUser;
  next();
});

export const getCartDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name coverImg variants',
  });

  if (!cart) return next(new AppError('Cart not found', 404));

  const cartDetails = await Promise.all(
    cart.items.map(async (item) => {
      const product = item.productId;
      const variant = product.variants.find(
        (v) => v._id.toString() === item.colorId
      );
      const size = variant.sizes.find((s) => s._id.toString() === item.sizeId);

      return {
        id: item._id,
        productId: product._id,
        name: product.name,
        color: variant.color,
        images: variant.images[0],
        size: size.nameSize,
        price: size.price,
        quantity: item.quantity,
        totalItemPrice: size.price * item.quantity,
        variantId: variant._id,
        sizeId: size._id,
      };
    })
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: cart.userId,
      items: cartDetails,
      total: cart.total,
    },
  });
});

export const removeCartItem = catchAsync(async (req, res, next) => {
  const cart = req.currentCart;
  const { cartItemId } = req.body;

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === cartItemId
  );

  if (itemIndex === -1) {
    return next(
      new AppError(
        'Không có sản phẩm tương ứng trong giỏ hàng',
        StatusCodes.NOT_FOUND
      )
    );
  }

  cart.items.splice(itemIndex, 1);

  await cart.save();

  return res.status(StatusCodes.OK).json({
    message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    data: cart,
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

// export const increaseProductQuantity = catchAsync(async (req, res, next) => {
//   const cart = req.currentCart;
//   const cartItemId = req.params.cartItemId;
//   const cartItem = cart.items.find(
//     (item) => item._id.toString() === cartItemId
//   );
//   if (!cartItem)
//     return next(
//       new AppError('Không có sản phẩm tương ứng', StatusCodes.NOT_FOUND)
//     );

//   cartItem.quantity += 1;
//   await cart.save();

//   // cart.total = cartItem.quantity * cartItem;

//   return res.status(StatusCodes.OK).json({ data: cart });
// });

const checkProductAvailability = (product, cartItem) => {
  // tìm variant theo colorId
  const variant = product.variants.find(
    (variant) => variant._id.toString() === cartItem.colorId
  );

  if (!variant) {
    return new AppError(
      'Không tìm thấy variant sản phẩm',
      StatusCodes.NOT_FOUND
    );
  }

  // tìm kích thước (size) theo sizeId
  const size = variant.sizes.find(
    (size) => size._id.toString() === cartItem.sizeId
  );

  if (!size) {
    return new AppError(
      'Không tìm thấy kích thước sản phẩm',
      StatusCodes.NOT_FOUND
    );
  }

  return size.inventory >= cartItem.quantity;
};

export const changeQuantityCart = catchAsync(async (req, res, next) => {
  const cart = req.currentCart;
  const { cartItemId, option } = req.body;

  const cartItem = cart.items.find(
    (item) => item._id.toString() === cartItemId
  );

  if (!cartItem) {
    return next(
      new AppError('Không có sản phẩm tương ứng', StatusCodes.NOT_FOUND)
    );
  }

  // lấy thông tin sản phẩm từ database
  const product = await Product.findById(cartItem.productId).populate(
    'variants.sizes'
  );

  if (option === '+') {
    const isAvailable = checkProductAvailability(product, cartItem);

    if (isAvailable === true) {
      cartItem.quantity += 1;
    } else {
      return next(
        new AppError(
          'Số lượng sản phẩm yêu cầu đã vượt quá số lượng tồn kho!',
          StatusCodes.BAD_REQUEST
        )
      ); // nếu không hợp lệ, trả về lỗi từ hàm kiểm tra
    }
  } else if (option === '-') {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      return next(
        new AppError('Sản phẩm đã ở mức tối thiểu', StatusCodes.BAD_REQUEST)
      );
    }
  } else {
    return next(
      new AppError('Giá trị option không hợp lệ', StatusCodes.BAD_REQUEST)
    );
  }

  await cart.save();

  return res.status(StatusCodes.OK).json({ data: cart });
});
