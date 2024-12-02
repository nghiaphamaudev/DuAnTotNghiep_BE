import { StatusCodes } from 'http-status-codes';
import Report from '../models/report.model';
import User from '../models/user.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';

export const createReport = catchAsync(async (req, res, next) => {
  const report = await Report.create(req.body);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
    data: report,
  });
});

export const handleAdminReport = catchAsync(async (req, res, next) => {
  const reportId = req.params.idReport;
  const { action, emailUser } = req.body; 

  if (!['Chấp nhận', 'Từ chối'].includes(action)) {
    return res.status(400).json({ message: 'Hành động không hợp lệ' });
  }

  const report = await Report.findOne({ _id: reportId });
  if (!report) {
    return next(new AppError('Không thấy báo cáo', StatusCodes.NOT_FOUND));
  }

  const user = await User.findOne({ email: emailUser });
  if (!user)
    return next(
      new AppError('Người dùng không tồn tại!', StatusCodes.NOT_FOUND)
    );

  // Cập nhật trạng thái
  report.status = action === 'Chấp nhận' ? 'Chấp nhận' : 'Từ chối';
  user.active = false;
  await user.save();
  await report.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Đã ${action === 'Chấp nhận' ? 'duyệt' : 'bỏ qua'} báo cáo`,
  });
});
