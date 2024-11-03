import mongoose from 'mongoose';

// Schema cho kích thước sản phẩm
const sizeSchema = new mongoose.Schema({
  nameSize: { type: String, required: true },
  price: { type: Number, required: true },
  inventory: { type: Number, required: true, min: 0 },
});

// Schema cho biến thể sản phẩm
const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [String],
  sizes: [sizeSchema],
});

// Schema cho sản phẩm trong giỏ hàng
// Schema cho sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    colorId: { type: String, required: true }, // id của màu sắc
    sizeId: { type: String, required: true }, // id của kích thước
    quantity: { type: Number, required: true, min: 1 }, // Số lượng
  },
  { _id: false }
);

// Schema giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema], // Danh sách sản phẩm trong giỏ hàng
    total: { type: Number, default: 0 }, // Tổng tiền
  },
  {
    timestamps: true, // Tạo trường createdAt và updatedAt
  }
);

// Tạo model cho giỏ hàng
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
