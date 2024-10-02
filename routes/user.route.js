import express from 'express';
import {
  register,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/auth.controller';
const userRouter = express.Router({ mergeParams: true });

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:resetToken', resetPassword);
userRouter.patch('/updatePassword', protect, updatePassword);

export default userRouter;