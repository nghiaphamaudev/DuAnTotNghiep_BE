import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    required: true,
    default: 'admin',
  },
  coverImg: {
    type: String,
    required: true,
    default:
      'https://res.cloudinary.com/dyv5zfnit/image/upload/v1727975620/users/user_default.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});
adminSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
