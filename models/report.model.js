import mongoose from 'mongoose';

const ReportRequestSchema = new mongoose.Schema({
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Chấp nhận', 'Từ chối'],
    default: 'Chờ duyệt',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', ReportRequestSchema);
export default Report;
