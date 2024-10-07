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
import {
  addAddress,
  addFavoriteProduct,
  deleteAddress,
  deleteMe,
  removeFavoriteProduct,
  updateAddress,
  updateMe,
  updateStatusAddress,
} from '../controllers/user.controller';
const userRouter = express.Router({ mergeParams: true });

userRouter.post('/auth/register', register);
userRouter.post('/auth/login', login);
userRouter.get('/auth/logout', logout);
userRouter.post('/auth/forgotPassword', forgotPassword);
userRouter.patch('/auth/resetPassword/:resetToken', resetPassword);

userRouter.use(protect);

userRouter.patch('/auth/updatePassword', updatePassword);
userRouter.patch('/deleteMe', deleteMe);
userRouter.patch('/updateMe', restrictTo('user'), uploadUserImage, updateMe);

userRouter.post('/address', addAddress);
userRouter.patch('/address/:addressId', updateAddress);
userRouter.patch('/delete-address/:addressId', deleteAddress);
userRouter.patch('/update-status-address/:addressId', updateStatusAddress);

userRouter
  .route('/favorite-products/:id')
  .post(addFavoriteProduct)
  .patch(removeFavoriteProduct);

export default userRouter;
