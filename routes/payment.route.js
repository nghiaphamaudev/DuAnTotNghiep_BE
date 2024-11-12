import { Router } from 'express';
const paymentRouter = Router();
import {
  createPaymentUrl,
  handleVnpayReturn,
} from './../services/payment.service';

paymentRouter.post('/payment', createPaymentUrl);
paymentRouter.get('/payment-return', handleVnpayReturn);
