const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      require: true,
    },
    orderItems: [
      {
        nameColor: String,
        image: String, //theo color
        size: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
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
    voucherDiscount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'],
      default: 'pending',
    },
    statusShip: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
