import { Router } from 'express';
const paymentRouter = Router();
import {
  paymentRedirect,
  processVnpayPaymentResponse,
} from './../services/payment.service';
import { protect } from '../controllers/auth.controller';

paymentRouter.get('/vnpay_ipn', processVnpayPaymentResponse);
paymentRouter.get('/vnpay_return', protect, paymentRedirect);


export default paymentRouter;
