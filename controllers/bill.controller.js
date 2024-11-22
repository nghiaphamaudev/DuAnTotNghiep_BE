import HistoryBill from '../models/historyBill.model';
import AppError from '../utils/appError.util';
import catchAsync from '../utils/catchAsync.util';
import { StatusCodes } from 'http-status-codes';
import Order from '../models/order.model';


export const createHistoryBill = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const { userId, idBill, statusBill } = req.body;
  const creator = currentUser.fullName;
  const role = currentUser.role;
  const historyBill = new HistoryBill({
    userId,
    idBill,
    create,
    creator,
    role,
    statusBill,
  });
  await historyBill.save();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật trạng thái đơn hàng thành công!',
  });
});

export const getHistoryBill = catchAsync(async (req, res, next) => {
  const idBill = req.para
  const data = await HistoryBill.find({ idBill: req.body.bill }).sort(
    'createdAt'
  );
  if (!data || data.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Không có lịch sử đơn hàng này',
      data,
    });
  }
  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Đã tìm thấy lịch sử đơn hàng!',
    data,
  });
});

