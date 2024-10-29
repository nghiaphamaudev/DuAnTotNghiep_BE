import Product from "../models/product.model";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catchAsync.util";
import AppError from "../utils/appError.util";
import Category from "../models/category.model"

//thêm sản phẩm 
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

    // Kiểm tra xem category có tồn tại không
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
        return next(new AppError('Category không tồn tại', StatusCodes.BAD_REQUEST));
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
    const { _page = 1, _limit = 10, _sort = "createdAt", _order = "asc" } = req.query;

    const sortOrder = _order === "desc" ? -1 : 1;
    const pageNumber = parseInt(_page);
    const pageSize = parseInt(_limit);

    // Sử dụng $lookup để thực hiện join với Category và hiển thị trống nếu không tồn tại
    const products = await Product.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryInfo"
            }
        },
        {
            $unwind: {
                path: "$categoryInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                category: { $ifNull: ["$categoryInfo.name", ""] }
            }
        },
        {
            $sort: { [_sort]: sortOrder }
        },
        {
            $skip: (pageNumber - 1) * pageSize
        },
        {
            $limit: pageSize
        },
        {
            $project: {
                categoryInfo: 0
            }
        }
    ]);

    // Kiểm tra nếu không có sản phẩm nào được tìm thấy
    if (products.length === 0) {
        return res.status(StatusCodes.OK).json({ data: [] });
    }

    const totalItems = await Product.countDocuments();
    const totalPages = Math.ceil(totalItems / pageSize);

    const response = {
        data: products,
        pagination: {
            currentPage: pageNumber,
            totalPages,
            totalItems,
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

    // Kiểm tra xem category có tồn tại hay không
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        return next(new AppError('Category không hợp lệ hoặc đã bị xóa', StatusCodes.BAD_REQUEST));
    }

    // Chuyển đổi discountPercentage sang số
    const discountPercent = parseFloat(discountPercentage) || 0;

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
                    if (size.price) {
                        size.discountedPrice = size.price - (size.price * (discountPercent / 100));
                    }
                    return size;
                }),
            })),
            discountPercentage: discountPercent,
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
    const products = await Product.find({
        category: req.params.categoryId,
        _id: { $ne: req.params.productId },
    }).populate({
        path: 'category',
        select: 'name',
    });

    return res.status(StatusCodes.OK).json({
        status: 'success',
        data: products,
    });
});


//xóa sản phẩm
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


// đổi trạng thái sản phẩm
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

