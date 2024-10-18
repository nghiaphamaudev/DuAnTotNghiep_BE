import express from 'express';
import {
  deleteCategory,
  updateCategory,
  createCategory,
  getAllCategory,
  getCategoryById,
} from '../controllers/category.controller';
const categoryRouter = express.Router();

categoryRouter.route('/').get(getAllCategory).post(createCategory);

categoryRouter
  .route('/:id')
  .delete(deleteCategory)
  .patch(updateCategory)
  .get(getCategoryById)

export default categoryRouter;
