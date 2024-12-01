export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Bạn không có quyền thực hiện hành động này!',
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};
