import Product from '../models/product.model';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import slugify from 'slugify';
import { productSchema } from '../validator/products.validator';
import { uploadProductImages } from '../middlewares/uploadCloud.middleware';

export const createProduct = catchAsync(async (req, res, next) => {
  // Kiểm tra và lấy ảnh bìa
  const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
  if (!coverImage) {
    console.log('No cover image found!');
    return next(
      new AppError('Ảnh bìa sản phẩm là bắt buộc', StatusCodes.BAD_REQUEST)
    );
  }

  const { name, category, description, variants } = req.body;

  // Kiểm tra các trường dữ liệu bắt buộc
  if (
    !name ||
    !category ||
    !description ||
    !variants ||
    variants.length === 0
  ) {
    return next(
      new AppError(
        'Tất cả các trường bắt buộc phải được cung cấp',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Tách ảnh của các biến thể
  const variantImages0 = req.files['variants[0][images]'] || [];
  const variantImages1 = req.files['variants[1][images]'] || [];

  // Nhóm ảnh biến thể theo từng biến thể
  const imagesByVariant = {
    0: variantImages0.map((file) => file.path),
    1: variantImages1.map((file) => file.path),
  };

  // Chuẩn bị dữ liệu sản phẩm
  const productData = {
    name,
    category,
    description,
    slug: slugify(name, { lower: true, strict: true }),
    coverImg: coverImage.path, // Gán đường dẫn ảnh bìa
    variants: variants.map((variant, index) => ({
      ...variant,
      // Gán các ảnh cho biến thể
      images: imagesByVariant[index] || [],
    })),
  };

  // Ghi log dữ liệu sản phẩm trước khi lưu
  console.log('Product data to be created:', productData);

  // Tạo sản phẩm
  const product = await Product.create(productData);

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: product,
  });
});

//lấy tất cả sản phẩm
export const getAllProducts = catchAsync(async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = 'createdAt',
    _order = 'asc',
    _expand,
  } = req.query;
  const options = {
    page: _page,
    limit: _limit,
    sort: { [_sort]: _order === 'desc' ? -1 : 1 },
  };
  const populateOptions = _expand ? [{ path: 'category', select: 'name' }] : [];

  const result = await Product.paginate(
    { categoryId: null },
    { ...options, populate: populateOptions }
  );

  if (result.docs.length === 0) {
    return res.status(StatusCodes.OK).json({ data: [] });
  }

  const response = {
    data: result.docs,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalItems: result.totalDocs,
    },
  };

  return res.status(StatusCodes.OK).json(response);
});

//lấy chi tiết sản phẩm theo ID for BE
export const getDetailProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại', StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({ data: product });
});

//Lấy chi tiết sản phẩm cho FE tìm kiếm bằng slug
export const getDetailProductBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params; // Chỉ cần lấy slug từ params

  console.log('Tìm kiếm sản phẩm với slug:', slug); // Log slug để kiểm tra

  const product = await Product.findOne({ slug: slug }).exec();

  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại', StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.OK).json({ data: product });
});
//cập nhật sản phẩm

export const updateProduct = catchAsync(async (req, res, next) => {
  // Kiểm tra xem có tệp nào không
  const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
  const variantImages0 = req.files['variants[0][images]'] || [];
  const variantImages1 = req.files['variants[1][images]'] || [];

  // Lấy đường dẫn ảnh bìa
  if (!coverImage) {
    return next(new AppError('Ảnh bìa là bắt buộc', StatusCodes.BAD_REQUEST));
  }

  const { name, category, description, variants } = req.body;

  // Kiểm tra các trường bắt buộc
  if (
    !name ||
    !category ||
    !description ||
    !variants ||
    variants.length === 0
  ) {
    return next(
      new AppError(
        'Tất cả các trường bắt buộc phải được cung cấp',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Tìm sản phẩm cũ để kiểm tra tên
  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }

  // Cập nhật thông tin sản phẩm
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      category,
      description,
      coverImg: coverImage.path, // Gán đường dẫn ảnh bìa
      variants: variants.map((variant, index) => ({
        ...variant,
        // Gán các ảnh cho biến thể
        images:
          index === 0
            ? variantImages0.map((file) => file.path)
            : variantImages1.map((file) => file.path),
      })),
      // Cập nhật slug nếu tên sản phẩm thay đổi
      slug: slugify(name, { lower: true, strict: true }), // Cập nhật slug mới
    },
    { new: true, runValidators: true }
  );

  // Kiểm tra xem sản phẩm có được tìm thấy không
  if (!updatedProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }

  // Phản hồi thành công
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

//gợi ý sản phẩm theo danh mục
export const relatedProduct = catchAsync(async (req, res, next) => {
  const product = await Product.find({
    category: req.params.categoryId,
    _id: { $ne: req.params.productId },
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: product,
  });
});

export const deleteProductStatus = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: 'Disabled' },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    return next(new AppError('The ID product not existed!', 400));
  }

  return res.status(200).json({
    status: 'success',
    data: product,
  });
});
