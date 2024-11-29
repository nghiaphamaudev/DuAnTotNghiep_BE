import Joi from 'Joi';

export const discountSchema = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'Mã giảm giá là bắt buộc',
  }),
  description: Joi.string().allow(''),
  discountType: Joi.string().valid('percentage', 'amount').required().messages({
    'any.required': 'Loại giảm giá là bắt buộc',
    'any.only': "Loại giảm giá phải là 'percentage' hoặc 'amount'",
  }),
  discountPercentage: Joi.number()
    .min(0)
    .max(100)
    .when('discountType', {
      is: 'percentage',
      then: Joi.required().messages({
        'any.required':
          "Phần trăm giảm giá là bắt buộc khi loại giảm giá là 'percentage'",
        'number.min': 'Phần trăm giảm giá phải lớn hơn hoặc bằng 0',
        'number.max': 'Phần trăm giảm giá phải nhỏ hơn hoặc bằng 100',
      }),
    }),
  discountAmount: Joi.number()
    .min(0)
    .when('discountType', {
      is: 'amount',
      then: Joi.required().messages({
        'any.required':
          "Số tiền giảm giá là bắt buộc khi loại giảm giá là 'amount'",
        'number.min': 'Số tiền giảm giá phải lớn hơn hoặc bằng 0',
      }),
    }),
  startDate: Joi.date().required().messages({
    'any.required': 'Ngày bắt đầu là bắt buộc',
  }),
  expirationDate: Joi.date().required().messages({
    'any.required': 'Ngày kết thúc là bắt buộc',
  }),
  quantity: Joi.number().min(1).required().messages({
    'any.required': 'Số lượng là bắt buộc',
    'number.min': 'Số lượng phải lớn hơn 0',
  }),
  minPurchaseAmount: Joi.number().min(0).default(0),
  status: Joi.string().valid('active', 'inactive').default('active'),
});
