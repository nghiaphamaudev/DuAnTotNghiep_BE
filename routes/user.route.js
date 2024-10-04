import express from 'express';
import {
  register,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from '../controllers/auth.controller';
import { uploadUserImage } from '../middlewares/uploadCloud.middleware';
import { deleteMe, updateMe } from '../controllers/user.controller';
const userRouter = express.Router({ mergeParams: true });

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:resetToken', resetPassword);

userRouter.use(protect);

userRouter.patch('/updatePassword', updatePassword);
userRouter.patch('/deleteMe', deleteMe);
userRouter.patch('/updateMe', restrictTo('user'), uploadUserImage, updateMe);

export default userRouter;
