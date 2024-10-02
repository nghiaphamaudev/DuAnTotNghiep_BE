const productSchema = Joi.object({
    name: Joi.string().min(3).required(),
    price: Joi.number().positive().required(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
    // Thêm các trường khác nếu cần
});