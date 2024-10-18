import AppError from '../utils/appError.util';
import { StatusCodes } from 'http-status-codes';
const handleValidatorError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = errors.join('. ');
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleCastError = (error) => {
  const message = 'ID sản phẩm không tồn tại!';
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateDB = (error) => {
  const valueDuplicate = error.errorResponse.keyValue;
  let values = Object.getOwnPropertyNames(valueDuplicate);
  values = values.map((value) =>
    value.replace(value[0], value[0].toUpperCase())
  );
  values = values.join(' ');
  const message = `${values} đã tồn tại . Thử lại!`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTExpired = (error) => {
  const message = 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.';
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleLimitFileUser = (error) => {
  const message = 'Tối đa 1 hỉnh ảnh';
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, req, res) => {
  if (res.headersSent) {
    return;
  }
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Có gì đó không ổn!!',
    });
  }
};

const errorHandlerGlobal = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'ValidationError') error = handleValidatorError(error);
    if (err.code === 11000) error = handleDuplicateDB(error);
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.message === 'jwt expired') error = handleJWTExpired(error);
    if (err.code === 'LIMIT_UNEXPECTED_FILE')
      error = handleLimitFileUser(error);
    sendErrorProd(error, req, res);
  }
};

export default errorHandlerGlobal;
