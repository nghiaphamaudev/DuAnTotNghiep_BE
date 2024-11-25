import Voucher from '../models/voucher.model';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import { discountSchema } from '../validator/voucher.validator';

export const addVoucher = catchAsync(async (req, res, next) => {
  const { error } = discountSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ messages });
  }

  const newVoucher = new Voucher(req.body);
  await newVoucher.save();
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Voucher tạo thành công',
    data: newVoucher,
  });
});

export const updateVoucher = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(req.body);

  const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedVoucher) {
    return next(new AppError('Voucher not found', StatusCodes.NOT_FOUND));
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cập nhật voucher thành công',
    data: updatedVoucher,
  });
});

export const deleteVoucher = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedVoucher = await Voucher.findByIdAndDelete(id);

  if (!deletedVoucher) {
    return next(new AppError('Voucher not found', StatusCodes.NOT_FOUND));
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Voucher được xóa thành công !',
    data: null,
  });
});

export const getVouchers = catchAsync(async (req, res, next) => {
  const vouchers = await Voucher.find();
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Lấy thành công vouchers', data: vouchers });
});
