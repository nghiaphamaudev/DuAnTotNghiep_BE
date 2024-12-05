import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import AppError from './utils/appError.util.js';
import errorHandlerGlobal from './middlewares/errorHandler.middleware.js';
import categoryRouter from './routes/category.route.js';
import userRouter from './routes/user.route.js';
import productRouter from './routes/product.route.js';
import categorySeasonRouter from './routes/categorySeason.router.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';
import paymentRouter from './routes/payment.route.js';
import billRouter from './routes/bill.route.js';
import feedbackRouter from './routes/feedback.router.js';
import voucherRouter from './routes/voucher.route.js';
import adminRouter from './routes/admin.route.js';
import reportRouter from './routes/report.route.js';
import statementRouter from './routes/statement.route.js';

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'], //port fe
  })
);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/season', categorySeasonRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/bills', billRouter);
app.use('/api/v1/feedback', feedbackRouter);

app.use('/api/v1/vouchers', voucherRouter);
app.use('/api/v1/superadmins', adminRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/statements', statementRouter);
app.all('*', (req, res, next) => {
  return next(
    new AppError(
      ` Can't find  ${req.originalUrl} not on this server. Try again!`,
      404
    )
  );
});

app.use(errorHandlerGlobal);

export default app;
