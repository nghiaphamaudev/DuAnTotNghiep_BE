import Product from '../models/product.model';
import { OK, StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync.util';
import AppError from '../utils/appError.util';
import slugify from 'slugify';
import { cloudinaryDelete } from '../middlewares/uploadCloud.middleware';
import mongoose from 'mongoose';
import Cart from '../models/cart.model';
import Feedback from '../models/feedback.model';




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
  const variantImages2 = req.files['variants[2][images]'] || [];
  const variantImages3 = req.files['variants[3][images]'] || [];

  // Nhóm ảnh biến thể theo từng biến thể
  const imagesByVariant = {
    0: variantImages0.map((file) => file.path),
    1: variantImages1.map((file) => file.path),
    2: variantImages2.map((file) => file.path),
    3: variantImages3.map((file) => file.path),
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
    _limit = 40,
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

  const feedbacks = await Feedback.find({ productId: product._id })
    .populate('user', 'rating fullName avatar');  // Populate user thông qua feedback

  // Tính toán ratingAverage từ feedbacks
  const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  const ratingAverage = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;
  product.ratingAverage = ratingAverage;

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

  if (!name || !category || !description || !variants || variants.length === 0) {
    return next(
      new AppError('Tất cả các trường bắt buộc phải được cung cấp', StatusCodes.BAD_REQUEST)
    );
  }

  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }

  const updatedData = {
    name,
    category,
    description,
    slug: slugify(name, { lower: true, strict: true }),
  };

  // Xử lý các biến thể đã tồn tại
  updatedData.variants = await Promise.all(variants.map(async (variant, index) => {
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

    const updatedSizes = variant.sizes.map((size, sizeIndex) => {
      size._id = existingProduct.variants[index]?.sizes[sizeIndex]?._id;
      return size;
    });


    return {
      ...variant,
      images: updatedImages,
      imageFiles: [],
      sizes: updatedSizes,
      _id: existingProduct.variants[index]?._id,  // Giữ nguyên _id của variant
    };
  }));

  // Kiểm tra và thêm các biến thể mới nếu chưa tồn tại
  const newVariants = variants.slice(existingProduct.variants.length);
  newVariants.forEach((newVariant) => {
    // Kiểm tra xem biến thể mới đã tồn tại chưa (dựa trên `slug` hoặc `id`)
    const isDuplicate = updatedData.variants.some(existingVariant =>
      existingVariant.slug === newVariant.slug  // Kiểm tra trùng lặp dựa trên slug
    );
    if (!isDuplicate) {
      updatedData.variants.push(newVariant);  // Thêm biến thể mới nếu chưa có
    }
  });

  // Cập nhật hình ảnh bìa
  if (coverImage) {
    updatedData.coverImg = coverImage.path;
  } else {
    updatedData.coverImg = existingProduct.coverImg;
  }

  // Cập nhật sản phẩm với $set để không thay thế toàn bộ tài liệu
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updatedData },  // Chỉ cập nhật các trường đã thay đổi
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return next(
      new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND)
    );
  }

  // Trả về phản hồi
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Thành công',
    data: {
      product: updatedProduct,
    },
  });
});






export const toggleVariantStatus = catchAsync(async (req, res, next) => {
  const { productId, variantId } = req.params;
  const product = await Product.findOne({ _id: productId, 'variants._id': variantId });
  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại hoặc biến thể không tồn tại', StatusCodes.NOT_FOUND));
  }
  const variant = product.variants.find(v => v._id.toString() === variantId);
  if (variant) {
    const newStatus = variant.status === true ? false : true;
    await Product.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      {
        $set: {
          'variants.$.status': newStatus,
        },
      },
      { new: true }
    );
    const updatedProduct = await Product.findById(productId);
    const updatedVariant = updatedProduct.variants.find(v => v._id.toString() === variantId);
    if (!updatedVariant.status) {
      await Cart.updateMany(
        { 'items.variantId': variantId },
        { $pull: { items: { variantId: variantId } } }
      );
      console.log(`Biến thể ${variantId} đã được xóa khỏi giỏ hàng`);
    }

    res.status(StatusCodes.OK).json({
      status: 'OK',
      message: `Trạng thái biến thể đã được đổi thành ${updatedVariant.status ? 'true' : 'false'}`,
    });
  }
});



export const toggleSizeStatus = catchAsync(async (req, res, next) => {
  const { productId, variantId, sizeId } = req.params;

  // Tìm sản phẩm và biến thể có chứa size
  const product = await Product.findOne({ _id: productId, 'variants._id': variantId });
  if (!product) {
    return next(new AppError('Sản phẩm hoặc biến thể không tồn tại', StatusCodes.NOT_FOUND));
  }

  const variant = product.variants.find(v => v._id.toString() === variantId);
  if (!variant) {
    return next(new AppError('Biến thể không tồn tại', StatusCodes.NOT_FOUND));
  }

  const size = variant.sizes.find(s => s._id.toString() === sizeId);
  if (!size) {
    return next(new AppError('Kích thước không tồn tại', StatusCodes.NOT_FOUND));
  }

  // Đổi trạng thái kích thước
  const newStatus = size.status === true ? false : true;

  await Product.findOneAndUpdate(
    { _id: productId, 'variants._id': variantId, 'variants.sizes._id': sizeId },
    {
      $set: {
        'variants.$[variant].sizes.$[size].status': newStatus,
      },
    },
    {
      arrayFilters: [
        { 'variant._id': variantId }, // Điều kiện cho mảng variants
        { 'size._id': sizeId },       // Điều kiện cho mảng sizes
      ],
      new: true,
    }
  );

  // Nếu trạng thái bị tắt, xóa kích thước khỏi giỏ hàng
  if (!newStatus) {
    await Cart.updateMany(
      { 'items.sizeId': sizeId },
      { $pull: { items: { sizeId: sizeId } } }
    );
    console.log(`Kích thước ${sizeId} đã được xóa khỏi giỏ hàng`);
  }

  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: `Trạng thái kích thước đã được đổi thành ${newStatus ? 'true' : 'false'}`,
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

  if (!product.isActive) {
    await Cart.updateMany(
      { 'items.productId': id },
      { $pull: { items: { productId: id } } }
    );
    console.log(`Product ${id} đã được xóa khỏi tất cả các giỏ hàng`);
  }

  res.status(200).json({
    status: 'success',
    data: {
      id: product._id,
      isActive: product.isActive,
    },
  });
};









