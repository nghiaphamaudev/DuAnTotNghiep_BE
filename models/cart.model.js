import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    colorId: { type: String, required: true },
    sizeId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
  }
);

// Schema giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema], // Danh sách sản phẩm trong giỏ hàng
    total: { type: Number, default: 0 }, // Tổng tiền
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);
cartItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
// Tạo model cho giỏ hàng
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
