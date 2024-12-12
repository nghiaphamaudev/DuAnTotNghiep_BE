import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: { type: String, required: true },
    sizeId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
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

orderItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      require: true,
    },
    orderItems: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    receiver: String,
    address: String,
    phoneNumber: String,
    message: String,
    paymentMethod: {
      type: String,
      enum: ['COD', 'VNPAY'],
      default: 'COD',
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discountCode: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đóng gói chờ vận chuyển',
        'Đang giao hàng',
        'Đã giao hàng',
        'Hoàn đơn',
        'Đã hủy',
        'Đã nhận được hàng',
      ],
      default: 'Chờ xác nhận',
    },
    statusPayment: {
      type: String,
      enum: ['Chưa thanh toán', 'Đã thanh toán'],
      default: 'Chưa thanh toán',
    },
    discountVoucher: {
      type: Number,
    },
    statusShip: {
      type: Boolean,
      default: false,
      required: true,
    },
    orderNote: {
      type: String,
    },
  },
  {
    timestamps: true, // Đặt timestamps ở đây
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
orderSchema.virtual('totalCost').get(function () {
  const shippingCost = this.shippingCost ?? 0; // Sử dụng nullish coalescing (nếu undefined thì là 0)
  const voucherDiscount = this.discountVoucher ?? 0;
  const productTotal = this.totalPrice ?? 0; // Nếu không có totalPrice, coi như 0
  return productTotal + shippingCost - voucherDiscount;
});

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
orderSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});
const Order = mongoose.model('Order', orderSchema);
export default Order;
