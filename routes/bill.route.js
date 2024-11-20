import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';

const billRouter = Router();

// billRouter.get('/', protect, getAllBillByUser);
// billRouter.get('/:orderId', getBilDetailByUser);

export default billRouter;
