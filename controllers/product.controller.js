import Product from "../models/product.model";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catchAsync.util";
import AppError from "../utils/appError.util";
import { productSchema } from '../validator/products.validator';
import { uploadProductImages } from "../middlewares/uploadCloud.middleware";


export const createProduct = catchAsync(async (req, res, next) => {

    if (!req.files || req.files.length === 0) {
        console.log('No cover image found!');
        return next(new AppError('Ảnh bìa sản phẩm là bắt buộc', StatusCodes.BAD_REQUEST));
    }
    const { name, category, description, variants } = req.body;

    if (!name || !category || !description || !variants || variants.length === 0) {
        return next(new AppError('Tất cả các trường bắt buộc phải được cung cấp', StatusCodes.BAD_REQUEST));
    }

    // Lấy đường dẫn ảnh bìa từ file đầu tiên
    const coverImg = req.files[0].path;

    // Tạo sản phẩm
    const productData = {
        name,
        category,
        description,
        coverImg,
        variants: variants.map(variant => ({
            ...variant,
            images: req.files.map(file => file.path)
        })),
    };

    // Ghi log dữ liệu sản phẩm trước khi lưu
    console.log('Product data to be created:', productData);

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
    const populateOptions = _expand ? [{ path: "category", select: "name" }] : [];

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

//lấy chi tiết sản phẩm
export const getProductById = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        // Nếu không tìm thấy sản phẩm
        throw new AppError('Product not found', StatusCodes.NOT_FOUND);
    }

    return res.status(StatusCodes.OK).json(product);
});

//cập nhật sản phẩm

export const updateProduct = catchAsync(async (req, res, next) => {

    if (!req.files || req.files.length === 0) {
        return next(new AppError('Ảnh bìa sản phẩm là bắt buộc', 400));
    }

    // Lấy đường dẫn ảnh bìa từ file đầu tiên
    const coverImg = req.files[0].path;

    const { name, category, description, variants } = req.body;

    // Cập nhật thông tin sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name,
            category,
            description,
            coverImg,
            variants: variants.map((variant) => ({
                ...variant,
                images: req.files.map((file) => file.path),
            })),
        },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        return next(new AppError('Không tìm thấy sản phẩm với ID này', 404));
    }
    res.status(200).json({
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

