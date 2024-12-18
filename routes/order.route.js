import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  createOrder,
  getAllOrderByUserId,
  getOrderDetailByUser,
  updateStatusOrderByUser,
} from '../controllers/order.controller';
import { getCartByUser } from '../controllers/cart.controller';
import { protectAdmin } from '../middlewares/checkRole.middeleware';

const orderRouter = Router({ mergeParams: true });

orderRouter.get('/:orderId', protect, getOrderDetailByUser);
orderRouter.post('/', protect, getCartByUser, createOrder);
orderRouter.get('/', protect, getAllOrderByUserId);
orderRouter.patch('/update-order', protect, updateStatusOrderByUser);

export default orderRouter;
