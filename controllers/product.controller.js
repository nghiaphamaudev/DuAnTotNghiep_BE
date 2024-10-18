import Product from "../models/product.model";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catchAsync.util";
import AppError from "../utils/appError.util";
import CategorySeason from "../models/categorySeason.model";
import { productSchema } from '../validator/products.validator';
import { uploadProductImages } from "../middlewares/uploadCloud.middleware";


export const createProduct = catchAsync(async (req, res, next) => {
    // Kiểm tra và lấy ảnh bìa
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
    if (!coverImage) {
        console.log('No cover image found!');
        return next(new AppError('Ảnh bìa sản phẩm là bắt buộc', StatusCodes.BAD_REQUEST));
    }

    const { name, category, description, variants } = req.body;

    // Kiểm tra các trường dữ liệu bắt buộc
    if (!name || !category || !description || !variants || variants.length === 0) {
        return next(new AppError('Tất cả các trường bắt buộc phải được cung cấp', StatusCodes.BAD_REQUEST));
    }

    // Tách ảnh của các biến thể
    const variantImages0 = req.files['variants[0][images]'] || [];
    const variantImages1 = req.files['variants[1][images]'] || [];

    // Nhóm ảnh biến thể theo từng biến thể
    const imagesByVariant = {
        0: variantImages0.map(file => file.path),
        1: variantImages1.map(file => file.path),
    };

    // Chuẩn bị dữ liệu sản phẩm
    const productData = {
        name,
        category,
        description,
        coverImg: coverImage.path,
        variants: variants.map((variant, index) => ({
            ...variant,
            // Gán các ảnh cho biến thể
            images: imagesByVariant[index] || [],
            // Gán discountedPrice bằng với price cho từng size
            sizes: variant.sizes.map(size => ({
                ...size,
                discountedPrice: size.price, // Đặt discountedPrice bằng với price
            })),
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
    const { _page = 1, _limit = 10, _sort = "createdAt", _order = "asc", _expand } = req.query;

    const options = {
        page: _page,
        limit: _limit,
        sort: { [_sort]: _order === "desc" ? -1 : 1 },
    };

    const populateOptions = _expand ? { path: "category", select: "name" } : null;

    const result = await Product.paginate(
        {},
        { ...options, populate: populateOptions }
    );

    // Kiểm tra nếu không có sản phẩm nào được tìm thấy
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


//lấy chi tiết sản phẩm
export const getProductById = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
        // Nếu không tìm thấy sản phẩm
        throw new AppError('Product not found', StatusCodes.NOT_FOUND);
    }

    return res.status(StatusCodes.OK).json(product);
});

//cập nhật sản phẩm

export const updateProduct = catchAsync(async (req, res, next) => {
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
    const variantImages0 = req.files['variants[0][images]'] || [];
    const variantImages1 = req.files['variants[1][images]'] || [];

    if (!coverImage) {
        return next(new AppError('Ảnh bìa là bắt buộc', StatusCodes.BAD_REQUEST));
    }

    const { name, category, description, variants, discountPercentage } = req.body;

    if (!name || !category || !description || !variants || variants.length === 0) {
        return next(new AppError('Tất cả các trường bắt buộc phải được cung cấp', StatusCodes.BAD_REQUEST));
    }

    // Chuyển đổi discountPercentage sang số
    const discountPercent = parseFloat(discountPercentage) || 0; // Nếu không phải số, gán giá trị 0

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name,
            category,
            description,
            coverImg: coverImage.path,
            variants: variants.map((variant, index) => ({
                ...variant,
                images: index === 0 ? variantImages0.map(file => file.path) : variantImages1.map(file => file.path),
                sizes: variant.sizes.map(size => {
                    // Tính toán discountedPrice nếu có discountPercentage
                    if (size.price) {
                        size.discountedPrice = size.price - (size.price * (discountPercent / 100));
                    }
                    return size;
                }),
            })),
            discountPercentage: discountPercent, // Cập nhật discountPercentage
        },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        return next(new AppError('Không tìm thấy sản phẩm với ID này', StatusCodes.NOT_FOUND));
    }

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

