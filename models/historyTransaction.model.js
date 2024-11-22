import mongoose from 'mongoose';
const historyTransactionSchema = new mongoose.Schema(
  {
    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    idBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    transCode: {
      //lấy từ order
      type: String,
    },
    type: {
      type: String,
      enum: ['Tiền mặt', 'Chuyển khoản'],
      default: 'Tiền mặt',
    },
    totalMoney: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
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

      versionKey: false,
    },
  }
);
historyTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
const HistoryTransaction = mongoose.model(
  'HistoryTransaction',
  historyTransactionSchema
);
export default HistoryTransaction;
