import mongoose from 'mongoose';

// Dùng để lưu trạng thái khi admin thao tác như xác nhận đơn hàng, vận chuyển ....
const historyBillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
      type: String,
    },
    idBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    role: {
      type: String, // vai trò của người thao tác
      required: true,
    },
    statusBill: {
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
    },
    note: {
      type: String,
      required: false,
      //message của mỗi trạng thái
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
historyBillSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
const HistoryBill = mongoose.model('HistoryBill', historyBillSchema);
export default HistoryBill;
