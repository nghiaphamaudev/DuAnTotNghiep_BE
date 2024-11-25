import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'amount'],
      required: true,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: function () {
        return this.discountType === 'percentage';
      },
    },
    discountAmount: {
      type: Number,
      required: function () {
        return this.discountType === 'amount';
      },
    },

    startDate: { type: Date, default: Date.now },
    expirationDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'expired', 'disabled'],
      default: 'active',
    },
    minPurchaseAmount: { type: Number, min: 0, default: 0 },
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);
voucherSchema.index({ code: 1, status: 1 });

voucherSchema.pre('save', function (next) {
  const now = new Date();
  if (this.expirationDate < now) {
    this.status = 'expired';
  }
  next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
