import Joi from "joi"

export const productSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Tên sản phẩm không được để trống',
        'any.required': 'Tên sản phẩm là bắt buộc',
    }),

    category: Joi.string().required().messages({
        'string.empty': 'Danh mục sản phẩm không được để trống',
        'any.required': 'Danh mục sản phẩm là bắt buộc',
    }),

    coverImg: Joi.string().required().messages({
        'string.empty': 'Ảnh bìa sản phẩm không được để trống',
        'any.required': 'Ảnh bìa sản phẩm là bắt buộc',
    }),

    ratingAverage: Joi.number().min(0).messages({
        'number.base': 'Điểm đánh giá phải là số',
        'number.min': 'Điểm đánh giá không được nhỏ hơn 0',
    }),

    variants: Joi.array().items(
        Joi.object({
            color: Joi.string().required().messages({
                'string.empty': 'Màu sắc không được để trống',
                'any.required': 'Màu sắc là bắt buộc',
            }),
            images: Joi.array().items(Joi.string()).messages({
                'string.base': 'Ảnh phải là chuỗi',
            }),
            sizes: Joi.array().items(
                Joi.object({
                    nameSize: Joi.string().required().messages({
                        'string.empty': 'Kích thước không được để trống',
                        'any.required': 'Kích thước là bắt buộc',
                    }),
                    price: Joi.number().required().messages({
                        'number.base': 'Giá phải là số',
                        'any.required': 'Giá là bắt buộc',
                    }),
                    inventory: Joi.number().min(0).required().messages({
                        'number.base': 'Tồn kho phải là số',
                        'number.min': 'Tồn kho không được nhỏ hơn 0',
                        'any.required': 'Tồn kho là bắt buộc',
                    }),
                })
            ),
        })
    ),

    ratingQuantity: Joi.number().min(0).messages({
        'number.base': 'Số lượng đánh giá phải là số',
        'number.min': 'Số lượng đánh giá không được nhỏ hơn 0',
    }),

    description: Joi.string().required().messages({
        'string.empty': 'Mô tả không được để trống',
        'any.required': 'Mô tả là bắt buộc',
    }),

    status: Joi.string()
        .valid('Available', 'OutOfStock', 'Disabled')
        .default('Available')
        .messages({
            'any.only': 'Trạng thái chỉ có thể là "Available", "OutOfStock", hoặc "Disabled"',
        }),
});


