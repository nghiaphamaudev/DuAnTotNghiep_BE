import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        nameColor: String,
        image: String, //theocolor
        size: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Laptop',
        },
        isSelected: {
          type: Boolean,
          default: true,
        },
      },
    ],
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
