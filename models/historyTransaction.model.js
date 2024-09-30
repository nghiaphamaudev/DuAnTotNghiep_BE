import mongoose from 'mongoose';
const historyTransaction = new mongoose.Schema(
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
      type: Boolean,
      required: true, // true - tiền mặt | false - chuyển khoản
    },
    totalMoney: {
      type: String,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const HistoryTransaction = mongoose.model(
  'HistoryTransaction',
  historyTransaction
);
export default HistoryTransaction;
