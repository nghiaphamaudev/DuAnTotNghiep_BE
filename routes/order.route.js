import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import {
  createOrder,
  getAllOrderByUserId,
  updateStatusOrder,
  getOrderDetailByUser,
} from '../controllers/order.controller';
import { getCartByUser } from '../controllers/cart.controller';

const orderRouter = Router();

orderRouter.use(protect);

orderRouter.post('/', getCartByUser, createOrder);
orderRouter.get('/', getAllOrderByUserId);
orderRouter.get('/:orderId', getOrderDetailByUser);
orderRouter.patch('/update-order', updateStatusOrder);


export default orderRouter;
