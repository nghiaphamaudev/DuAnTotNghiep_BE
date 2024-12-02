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
    transactionVnPayId: { type: String, required: false },
    transactionVnPayDate: { type: Number, required: true },
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
    refundStatus: {
      // Trạng thái hoàn tiền
      type: String,
      enum: ['Chưa hoàn trả', 'Đã hoàn trả', 'Chờ duyệt'],
      default: 'Chờ duyệt', // Mặc định là chưa hoàn tiền
    },
    refundDetails: {
      // Chi tiết về giao dịch hoàn tiền
      transactionType: {
        type: String,
        enum: ['Hoàn tiền toàn phần', 'Hoàn tiền một phần'],
      },
      refundAmount: {
        type: Number, // Số tiền đã hoàn lại
        default: 0,
      },
      refundDate: {
        type: Date, // Ngày thực hiện hoàn tiền
      },
      bankCode: {
        type: String,
      },
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
