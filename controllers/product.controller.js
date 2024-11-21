import Product from '../models/product.model';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import slugify from 'slugify';
import { cloudinaryDelete } from '../middlewares/uploadCloud.middleware';

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
  // Tạo sản phẩm
  const product = await Product.create(productData);

  return res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Thành công',
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
  } = req.query;

  // Cấu hình cho paginate
  const options = {
    page: _page,                // Trang hiện tại
    limit: _limit,              // Số lượng sản phẩm mỗi trang
    sort: { [_sort]: _order === 'desc' ? -1 : 1 },  // Cấu hình sắp xếp
  };

  // Populate category để lấy tên danh mục
  const populateOptions = [{ path: 'category', select: 'name' }];

  // Lấy dữ liệu phân trang từ MongoDB
  const result = await Product.paginate(
    { categoryId: null },       // Lọc theo điều kiện (ví dụ: categoryId = null)
    { ...options, populate: populateOptions } // Áp dụng populate cho trường category
  );

  // Nếu không có sản phẩm nào, trả về mảng rỗng
  if (result.docs.length === 0) {
    return res.status(StatusCodes.OK).json({ data: [] });
  }

  // Tạo cấu trúc dữ liệu trả về với thông tin phân trang
  const response = {
    data: result.docs,  // Danh sách sản phẩm
    pagination: {
      currentPage: result.page,          // Trang hiện tại
      totalPages: result.totalPages,     // Tổng số trang
      totalItems: result.totalDocs,      // Tổng số sản phẩm
    },
  };


  // Trả về dữ liệu với mã trạng thái OK
  return res.status(StatusCodes.OK).json(response);
});



//lấy chi tiết sản phẩm theo ID for BE
export const getDetailProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name');
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
  const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
  const { name, category, description, variants, imagesToDelete } = req.body;

  // Kiểm tra trường bắt buộc
  if (!name || !category || !description || !variants || variants.length === 0) {
    return next(
      new AppError('Tất cả các trường bắt buộc phải được cung cấp', StatusCodes.BAD_REQUEST)
    );
  }

  // Tìm sản phẩm cũ
  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }

  // Cập nhật thông tin sản phẩm cơ bản
  const updatedData = {
    name,
    category,
    description,
    slug: slugify(name, { lower: true, strict: true }),
    variants: await Promise.all(variants.map(async (variant, index) => {
      const variantImages = req.body[`variants[${index}][images]`] || [];
      const variantImageFiles = req.files[`variants[${index}][imageFiles]`] || [];
      let updatedImages = existingProduct.variants[index]?.images || [];
      if (variantImages.length > 0) {
        updatedImages = variantImages;
      }
      const newImagesFromFiles = variantImageFiles.map(file => file.path);
      updatedImages = [...updatedImages, ...newImagesFromFiles];
      if (imagesToDelete && imagesToDelete.length > 0) {
        updatedImages = updatedImages.filter(img => !imagesToDelete.includes(img));
        if (imagesToDelete.length > 0) {
          await cloudinaryDelete(imagesToDelete);
        }
      }

      return {
        ...variant,
        images: updatedImages,
        imageFiles: [],
      };
    })),
  };
  const newVariants = variants.slice(existingProduct.variants.length);
  newVariants.forEach((newVariant) => {
    const isDuplicate = existingProduct.variants.some(existingVariant =>
      existingVariant.id === newVariant.id || existingVariant.slug === newVariant.slug
    );
    if (!isDuplicate) {
      updatedData.variants.push(newVariant);
    }
  });
  if (coverImage) {
    updatedData.coverImg = coverImage.path;
  } else {
    updatedData.coverImg = existingProduct.coverImg;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updatedData,
    { new: true, runValidators: true }
  );
  if (!updatedProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
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
    status: true,
    message: 'Thành công',
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
  });
});

export const deleteProductStatus = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      id: product._id,
      isActive: product.isActive,
    },
  });
};