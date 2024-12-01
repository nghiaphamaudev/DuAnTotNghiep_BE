import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema(
  {
    // Tùy chỉnh id cho địa chỉ
    nameReceiver: { type: String, required: true },
    phoneNumberReceiver: { type: String, required: true },
    addressReceiver: {
      province: {
        code: { type: String, required: true },
      },
      district: {
        code: { type: String, required: true },
      },
      ward: {
        code: { type: String, required: true },
      },
    },
    detailAddressReceiver: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
      timestamps: true,
      versionKey: false,
    },
  }
);
addressSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
      required: true,
      default: 'Khác',
    },
    blockReason: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dyv5zfnit/image/upload/v1727975620/users/user_default.jpg',
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'superAdmin'],
      default: 'user',
    },
    rank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
    addresses: [addressSchema],
    favoriteProduct: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          required: false,
          ref: 'Laptop',
        },
      },
      { _id: false },
    ],
    password: {
      type: String,
      select: false,
      required: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },

      versionKey: false,
    },
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Mã hóa password trước khi lưu vào db
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});

// Kiểm tra password có được tạo mới hay thay đổi không
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// So sánh password db với password nhập bởi user
userSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

// Dùng để kiểm tra người dùng có thay đổi pass sau khi mã jwt được tạo hay không
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamps;
  }
  return false;
};

// Tạo 1 resetToken để
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// // Phương thức để chặn hoặc bỏ chặn người dùng
// userSchema.methods.toggleBlockUser = function (shouldBlock) {
//   this.active = !shouldBlock;
//   return this.save();
// };

const User = mongoose.model('User', userSchema);
export default User;
