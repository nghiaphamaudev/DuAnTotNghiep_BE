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

import categorySeasonRouter from './routes/categorySeason.router.js';
import productRouter from './routes/product.route.js';



const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/season', categorySeasonRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);


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
