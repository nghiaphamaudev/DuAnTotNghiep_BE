import CategorySeason from '../models/categorySeason.model';
import catchAsync from '../utils/catchAsync.util';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/appError.util';
import Product from '../models/product.model';

//thêm danh mục
export const addCategory = catchAsync(async (req, res, next) => {
  const { name, season } = req.body;

  // Kiểm tra nếu mùa
  const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
  if (!validSeasons.includes(season)) {
    return next(
      new AppError(
        `Invalid season. Please choose one of the following: ${validSeasons.join(
          ', '
        )}`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Tạo danh mục mới với mùa
  const newCategory = await CategorySeason.create({
    name,
    season,
  });

  return res.status(201).json({
    status: true,
    message: 'Thành công',
    data: newCategory,
  });
});

//lấy tất cả danh mục
export const getAllCategorySeason = catchAsync(async (req, res, next) => {
  const categoriesseason = await CategorySeason.find({});
  if (categoriesseason.length === 0) {
    return next(new AppError('No category', StatusCodes.NOT_FOUND));
  }
  return res.status(200).json({
    status: true,
    message: 'Thành công',
    data: categoriesseason,
  });
});

//lấy danh mục theo mùa
export const getCategoriesBySeason = catchAsync(async (req, res, next) => {
  const { season } = req.params;

  const categoriesseason = await CategorySeason.find({ season });

  // Nếu không có danh mục nào
  if (!categoriesseason.length) {
    return next(
      new AppError(`No categories found for ${season}`, StatusCodes.NOT_FOUND)
    );
  }

  // Trả về danh mục theo mùa
  return res.status(200).json({
    status: true,
    message: 'Thành công',
    data: categoriesseason,
  });
});

//lấy sản phẩm trong dung mục theo mùa
export const getProductsByCategoryAndSeason = catchAsync(
  async (req, res, next) => {
    const { id, season } = req.params; // Lấy ID danh mục và mùa từ URL params

    // Tìm danh mục theo ID
    const category = await CategorySeason.findById(id);

    // Kiểm tra danh mục
    if (!category) {
      return next(
        new AppError('The category ID does not exist!', StatusCodes.NOT_FOUND)
      );
    }

    // Kiểm tra mùa có khớp với mùa của danh mục không
    if (category.season !== season) {
      return next(
        new AppError(
          'The category does not belong to this season!',
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // Lấy tất cả sản phẩm thuộc danh mục
    const products = await Product.find({ category: id });
    if (!products.length) {
      return next(new AppError('No Product', StatusCodes.BAD_REQUEST));
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Thành công',
      category,
      products,
    });
  }
);

//xóa danh mục
export const deleteCategorySeason = catchAsync(async (req, res, next) => {
  const categorySeason = await CategorySeason.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!categorySeason) {
    return next(new AppError('The ID category not existed!', 400));
  }

  return res.status(200).json({
    status: true,
    message: 'Thành công',
    data: categorySeason,
  });
});

//update danh mục
export const updateCategorySeason = catchAsync(async (req, res, next) => {
  const { name, season } = req.body;

  if (!name && !season) {
    return next(
      new AppError(
        'At least one of category name or season is required for update!',
        400
      )
    );
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (season) updateData.season = season;

  const categorySeason = await CategorySeason.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!categorySeason) {
    return next(new AppError('The ID category not existed!', 400));
  }

  return res.status(200).json({
    status: true,
    message: 'Thành công',
    data: categorySeason,
  });
});
