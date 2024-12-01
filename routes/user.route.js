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
import { uploadUserImage } from '../middlewares/uploadCloud.middleware';
import {
  addAddress,
  addFavoriteProduct,
  changeUserRole,
  deleteAddress,
  deleteMe,
  deleteUserById,
  getAllUser,
  removeFavoriteProduct,
  toggleBlockUserById,
  updateAddress,
  updateMe,
  getMe,
  getUserById,
  updateStatusAddress,
} from '../controllers/user.controller';
const userRouter = express.Router({ mergeParams: true });

/**************AUTHENTICATION****************/
userRouter.post('/auth/register', register);
userRouter.post('/auth/login', login);
userRouter.get('/auth/logout', logout);
userRouter.post('/auth/forgotPassword', forgotPassword);
userRouter.patch('/auth/resetPassword/:resetToken', resetPassword);

userRouter.use(protect);
/**************USER-ACTIONS****************/
userRouter.patch('/auth/updatePassword', updatePassword);
userRouter.patch('/deleteMe', deleteMe);
userRouter.patch('/updateMe', uploadUserImage, updateMe);
userRouter.get('/getMe', getMe, getUserById);

userRouter.post('/address', addAddress);
userRouter.patch('/address/:addressId', updateAddress);
userRouter.patch('/delete-address/:addressId', deleteAddress);
userRouter.patch('/update-status-address/:addressId', updateStatusAddress);

userRouter
  .route('/favorite-products/:id')
  .post(addFavoriteProduct)
  .patch(removeFavoriteProduct);

/**************ADMIN-USER-MANAGEMENT****************/

userRouter.get('/admin', getAllUser);
userRouter.patch('/admin/:userId/toggle-block', toggleBlockUserById);
userRouter.patch('/admin/:userId/change-user-role', changeUserRole);
userRouter.delete('/admin/:userId', deleteUserById);

export default userRouter;
