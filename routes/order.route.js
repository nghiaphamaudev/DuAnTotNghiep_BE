import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import { createOrder } from '../controllers/order.controller';

const orderRouter = Router();

orderRouter.post('/', protect, createOrder);

export default orderRouter;
