import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  colorId: { type: String, required: true },
  sizeId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

// Schema giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema], // Danh sách sản phẩm trong giỏ hàng
    total: { type: Number, default: 0 }, // Tổng tiền
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

// Tạo model cho giỏ hàng
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
