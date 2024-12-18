import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: { type: String, required: true },
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

// Trường ảo tính tổng tiền cho mỗi sản phẩm trong giỏ hàng
// cartItemSchema.virtual('totalItemPrice').get(function () {
//   if (this.productId && this.productId.price) {
//     return this.quantity * this.productId.price;
//   }
//   return 0;
// });

cartItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Schema giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema], // Danh sách sản phẩm trong giỏ hàng
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

// Trường ảo tính tổng tiền của giỏ hàng
cartSchema.virtual('total').get(function () {
  return this.items.reduce((acc, item) => acc + item.totalItemPrice, 0);
});

// Tạo model cho giỏ hàng
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
