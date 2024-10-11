import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Tham chiếu tới bảng người dùng
      required: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product', // Tham chiếu tới bảng sản phẩm
      required: true,
    },
    variantId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product.variants', // Tham chiếu tới biến thể của sản phẩm
      required: true,
    },
    sizeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product.variants.sizes', // Tham chiếu tới size của sản phẩm
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
