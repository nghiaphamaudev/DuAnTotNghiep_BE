import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import { createOrder } from '../controllers/order.controller';
import { getCartByUser } from '../controllers/cart.controller';

const orderRouter = Router();

orderRouter.post('/', protect, getCartByUser, createOrder);

export default orderRouter;
