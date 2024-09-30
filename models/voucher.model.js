import mongoose from 'mongoose';
const voucherSchema = new mongoose.Schema(
  {
    //Mã voucher
    codeVoucher: {
      type: String,
      unique: true,
      required: [true, 'A category must to have a code !'],
    },
    //Mô tả của voucher vd Nhân ngày thành lập cửa hàng
    description: { type: String, default: '' },
    //Giảm giá theo % trên tồng đơn hàng hoặc trừ tiền thẳng
    discountType: {
      type: String,
      enum: ['discountPercentage', 'discountAmount'],
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
    //Ngày khuyến mãi bắt đầu
    startDate: { type: Date, default: Date.now },
    //Ngày khuyến mãi kết thúc
    expiredDate: { type: Date, required: true },
    // Số lần mà voucher còn có thể sử dụng
    quantity: { type: Number, required: true },
    // Số lượng người đã dùng voucher
    quantityUsed: { type: Number, default: 0 },
    // Trạng thái của voucher hoạt động, hết hạn, không thể sử dụng
    status: {
      type: String,
      enum: ['active', 'expired', 'disabled'],
      default: 'active',
    },
    // Số tiền tối thiểu mà voucher có thể áp dụng
    minPurchaseAmount: { type: Number, min: 0, default: 0 },
    // Người dùng đã sửu dụng thành công voucher
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;
