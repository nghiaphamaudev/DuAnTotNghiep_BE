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

export const checkAdminTask = (requiredRole) => {
  return (req, res, next) => {
    const currentAdminRole = req.admin.assignedRole; // Lấy nhiệm vụ của admin từ req.admin

    if (currentAdminRole !== requiredRole) {
      return next(
        new AppError('Bạn không có quyền truy cập vào phần này', 403) // Forbidden error
      );
    }
    next(); // Tiến hành xử lý tiếp nếu quyền truy cập hợp lệ
  };
};
