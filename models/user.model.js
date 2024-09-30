import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email !'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Vui lòng cung cấp email hợp lệ!'],
    },
    fullName: {
      type: String,
      required: [true, 'Please provide your email !'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide your email !'],
    },
    avatar: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    rank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
    addresses: [
      {
        name: String,
        phone: String,
        address: String,
        isDefault: Boolean,
      },
    ],
    favoriteProduct: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          required: false,
          ref: 'Laptop',
        },
      },
    ],
    password: {
      type: String,
      minlength: [8, 'Mật khẩu tối thiểu 8 kí tự'],
      select: false,
      required: [true, 'Please provide your password'],
    },
    passwordChangedAt: Date,
    passwordRefreshToken: String,
    passwordRefreshTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema);
export default User;
