import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
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
      select: false,
      required: true,
    },
    passwordChangedAt: Date,
    passwordRefreshToken: String,
    passwordRefreshTokenExpires: Date,
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

//So sánh password db với password nhập bởi user
userSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //Check passwordChangedAt is really exsited
  //true: Th user has been changed password
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamps;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
