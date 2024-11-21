
import catchAsync from '../utils/catchAsync.util';
import Category from '../models/category.model';
import AppError from '../utils/appError.util';
import Product from '../models/product.model';

export const getAllCategory = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  return res.status(200).json({
    status: 'success',
    data: categories,
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('The ID category not existed!', 400));
  }
  return res.status(200).json({
    status: 'success',
    data: category,
  });
});

//Thay đổi trạng thái danh mục set active
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    return next(new AppError('The ID category not existed!', 400));
  }

  return res.status(200).json({
    status: 'success',
    data: category,
  });
});

//Chỉ được cập nhật tên danh mục
export const updateCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError('Category name is required for update!', 400));
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    return next(new AppError('The ID category not existed!', 400));
  }

  return res.status(200).json({
    status: 'success',
    data: category,
  });
});

export const createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newCategory,
  });
});

export const getCategoryById = catchAsync(async (req, res, next) => {
  // Lấy danh mục theo ID từ request params
  const category = await Category.findById(req.params.id);

  // Kiểm tra xem danh mục có tồn tại không
  if (!category) {
    return next(new AppError('The ID category not existed!', 400));
  }

  // Lấy các sản phẩm thuộc danh mục
  const products = await Product.find({ category: req.params.id });

  // Phản hồi thành công
  return res.status(200).json({
    status: 'success',
    category,
    products,
  });
});
