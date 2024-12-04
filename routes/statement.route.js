import { Router } from 'express';
import {
  getTop5CustomersByDay,
  getTop5CustomersByWeek,
  getTop5CustomersByMonth,
  getTop5CustomersByYear,
  getTop5CustomersByRange,
  getTop3BestSellingProductsByDay,
  getTop3BestSellingProductsByWeek,
  getTop3BestSellingProductsByMonth,
  getTop3BestSellingProductsByYear,
  getTop3BestSellingProductsByRange,
  getRevenueAndRefundsByDay,
  getRevenueAndRefundsByWeek,
  getRevenueAndRefundsByMonth,
  getRevenueAndRefundsByYear,
  getRevenueAndRefundsByRange,
  getOrderStatusRatioByDay,
  getOrderStatusRatioByMonth,
  getOrderStatusRatioByWeek,
  getOrderStatusRatioByYear,
  getOrderStatusRatioByRange,
  getTop3ProductsByInventoryByDay,
  getTop3ProductsByInventoryByWeek,
  getTop3ProductsByInventoryByMonth,
  getTop3ProductsByInventoryByYear,
  getTop3ProductsByInventoryByRange,
} from '../controllers/statement.controller';

const statementRouter = Router();

//*************************TOP CUSTOMER*********************
statementRouter.get('/top-customers/day', getTop5CustomersByDay);
statementRouter.get('/top-customers/week', getTop5CustomersByWeek);
statementRouter.get('/top-customers/month', getTop5CustomersByMonth);
statementRouter.get('/top-customers/year', getTop5CustomersByYear);
statementRouter.get('/top-customers/range', getTop5CustomersByRange);

//************************TOP PRODUCT SELLING************** *
statementRouter.get('/top-products/day', getTop3BestSellingProductsByDay);
statementRouter.get('/top-products/week', getTop3BestSellingProductsByWeek);
statementRouter.get('/top-products/month', getTop3BestSellingProductsByMonth);
statementRouter.get('/top-products/year', getTop3BestSellingProductsByYear);
statementRouter.get('/top-products/range', getTop3BestSellingProductsByRange);

//*************************REVENUE************************** */
statementRouter.get('/revenue-and-refunds/day', getRevenueAndRefundsByDay);
statementRouter.get('/revenue-and-refunds/week', getRevenueAndRefundsByWeek);
statementRouter.get('/revenue-and-refunds/month', getRevenueAndRefundsByMonth);
statementRouter.get('/revenue-and-refunds/year', getRevenueAndRefundsByYear);
statementRouter.get('/revenue-and-refunds/range', getRevenueAndRefundsByRange);

//*************************ORDER STATUS************************
statementRouter.get('/order-status-ratio/day', getOrderStatusRatioByDay);
statementRouter.get('/order-status-ratio/month', getOrderStatusRatioByMonth);
statementRouter.get('/order-status-ratio/week', getOrderStatusRatioByWeek);
statementRouter.get('/order-status-ratio/year', getOrderStatusRatioByYear);
statementRouter.get('/order-status-ratio/range', getOrderStatusRatioByRange);

//***************************TOP PRODUCT INVENTORY**************************
statementRouter.get(
  '/top-products-inventory/day',
  getTop3ProductsByInventoryByDay
);
statementRouter.get(
  '/top-products-inventory/week',
  getTop3ProductsByInventoryByWeek
);
statementRouter.get(
  '/top-products-inventory/month',
  getTop3ProductsByInventoryByMonth
);
statementRouter.get(
  '/top-products-inventory/year',
  getTop3ProductsByInventoryByYear
);
statementRouter.get(
  '/top-products-inventory/range',
  getTop3ProductsByInventoryByRange
);

export default statementRouter;
