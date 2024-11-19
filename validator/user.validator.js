import Joi from 'joi';

const fullNameSchema = Joi.string().min(7).max(50).required().messages({
  'string.empty': 'Họ tên không được để trống',
  'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
  'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
  'any.required': 'Họ tên là bắt buộc',
});
const nameSchema = Joi.string().min(7).max(50).required().messages({
  'string.empty': 'Họ tên không được để trống',
  'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
  'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
  'any.required': 'Tên là bắt buộc',
});

const addressSchema = Joi.string().required().messages({
  'string.empty': 'Địa chỉ không được để trống',
  'any.required': 'Địa chỉ là bắt buộc',
});

const isDefault = Joi.boolean().optional();

// Định nghĩa schema cho từng phần của địa chỉ
const addressPartSchema = Joi.object({
  code: Joi.string().required().messages({
    'string.empty': 'Mã không được để trống',
    'any.required': 'Mã là bắt buộc',
  }),
});

// Schema cho toàn bộ địa chỉ
const addressReceiverSchema = Joi.object({
  province: addressPartSchema.required().messages({
    'any.required': 'Tỉnh/Thành phố là bắt buộc',
  }),
  district: addressPartSchema.required().messages({
    'any.required': 'Quận/Huyện là bắt buộc',
  }),
  ward: addressPartSchema.required().messages({
    'any.required': 'Phường/Xã là bắt buộc',
  }),
});

const detailAddressSchema = Joi.string().min(9).max(50).required().messages({
  'string.empty': 'Địa chỉ không được để trống',
  'string.min': 'Địa chỉ cụ thể phải có ít nhất {#limit} ký tự',
  'string.max': 'Địa chỉ cụ thể không được vượt quá {#limit} ký tự',
  'any.required': 'Địa chỉ cụ thể là bắt buộc',
});

const emailSchema = Joi.string().email().required().messages({
  'string.empty': 'Email không được để trống',
  'string.email': 'Email không hợp lệ!',
  'any.required': 'Vui lòng cung cấp email!',
});

const passwordSchema = Joi.string()
  .pattern(/[!@#$%^&*(),.?":{}|<>]/)
  .required()
  .min(6)
  .messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.pattern.base': 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
    'any.required': 'Mật khẩu là bắt buộc',
    'string.min': 'Mật khẩu phải tối thiểu {#limit} ký tự',
  });

const confirmPasswordSchema = Joi.string()
  .valid(Joi.ref('password')) // Tham chiếu đến trường password
  .required()
  .messages({
    'any.required': 'Xác nhận mật khẩu là bắt buộc',
    'any.only': 'Mật khẩu không trùng khớp',
  });

const phoneNumberSchema = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .required()
  .messages({
    'string.empty': 'Số điện thoại không được để trống',
    'string.pattern.base': 'Số điện thoại phải chứa 10 số',
    'any.required': 'Số điện thoại là bắt buộc',
  });

const genderSchema = Joi.string()
  .valid('Nam', 'Nữ', 'Khác')
  .required()
  .messages({
    'any.only': 'Giới tính chỉ được chọn giữa "Nam" hoặc "Nữ" hoặc "Khác"',
    'string.empty': 'Giới tính không được để trống',
    'any.required': 'Giới tính là bắt buộc',
  });

export const registerSchema = Joi.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  passwordConfirm: confirmPasswordSchema,
  phoneNumber: phoneNumberSchema,
});

export const loginSchema = Joi.object({
  email: emailSchema,
});

export const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});
export const resetPasswordSchema = Joi.object({
  passwordCurrent: passwordSchema,
  password: Joi.string()
    .pattern(/[!@#$%^&*(),.?":{}|<>]/) // Yêu cầu chứa ký tự đặc biệt
    .min(6) // Tối thiểu 6 ký tự
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
      'any.required': 'Mật khẩu là bắt buộc',
      'string.min': 'Mật khẩu phải tối thiểu {#limit} ký tự',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password')) // Tham chiếu tới `passwordCurrent`
    .required()
    .messages({
      'any.required': 'Xác nhận mật khẩu là bắt buộc',
      'any.only': 'Mật khẩu không trùng khớp',
    }),
});

export const updateMeSchema = Joi.object({
  fullName: fullNameSchema,
  phoneNumber: phoneNumberSchema,
  gender: genderSchema,
});

export const addAddressSchema = Joi.object({
  nameReceiver: nameSchema,
  phoneNumberReceiver: phoneNumberSchema,
  addressReceiver: addressReceiverSchema.required().label('Address Receiver'),
  detailAddressReceiver: detailAddressSchema,
  isDefault: isDefault,
});

export const checkAddressOrderSchema = Joi.object({
  receiver: nameSchema,
  phoneNumber: phoneNumberSchema,
  address: addressSchema,
});
