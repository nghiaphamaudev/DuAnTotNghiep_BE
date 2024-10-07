import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
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
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dyv5zfnit/image/upload/v1727975620/users/user_default.jpg',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

//Mã hóa password trước khi lưu vào db
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});

//kiểm tra password có được tạo mới hay thay đổi không , nếu ko thì ko cần cập nhật passwordchangedAt
//Nếu password thay đổi => passwordchangeAt = Thời gian hiện tại  -1000ms
//passwordChangedAt luôn trước thời điểm token JWT được tạo, tránh tình huống xung đột do sự chênh lệch thời gian.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//So sánh password db với password nhập bởi user
userSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

//dùng để kiểm tra  người dùng có thay đổi pass sau khi mã jwt được tạo hay không
//nếu this.passwordChangedAT tồn tại thì => user đã thay đổi password mà chưa đăng nhập lại
// Nếu changedTimestamps > JWTTimestamp  => người dùng đã thay đổi pass sau khi jwt đc tạo +. người dùng dăng nhập lại
//Nói cách khác là khi người dùng đăng nhập vào và sau đó thay đổi mật khẩu thì bắt phải đăng nhập lại
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

//Tạo 1 resetToken để
//resetToken chưa hash => user
// reset hashed => db
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
