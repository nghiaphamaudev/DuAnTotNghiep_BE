import express from 'express';
import {
  getCategory,
  deleteCategory,
  updateCategory,
  createCategory,
  getAllCategory,
} from '../controllers/category.controller';
const categoryRouter = express.Router();

categoryRouter.route('/').get(getAllCategory).post(createCategory);

categoryRouter
  .route('/:id')
  .get(getCategory)
  .delete(deleteCategory)
  .patch(updateCategory);

export default categoryRouter;
