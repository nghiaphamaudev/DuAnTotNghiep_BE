import { Router } from 'express';
const paymentRouter = Router();
import {
  createPaymentUrl,
  paymentRedirect,
  processVnpayPaymentResponse,
} from './../services/payment.service';

paymentRouter.get('/create-payment-url', createPaymentUrl);
paymentRouter.get('/vnpay_ipn', processVnpayPaymentResponse);
paymentRouter.get('/payment-return', paymentRedirect);

export default paymentRouter;
