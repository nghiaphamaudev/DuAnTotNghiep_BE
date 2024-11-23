import { Router } from 'express';
const paymentRouter = Router();
import {
  paymentRedirect,
  processVnpayPaymentResponse,
} from './../services/payment.service';

paymentRouter.get('/vnpay_ipn', processVnpayPaymentResponse);
paymentRouter.get('/vnpay_return', paymentRedirect);

export default paymentRouter;
