import express from 'express';
import {
  deleteCategory,
  updateCategory,
  createCategory,
  getAllCategory,
  getCategoryById,
  getCategory,
} from '../controllers/category.controller';
import { uploadCategoryImage } from '../middlewares/uploadCloud.middleware';

const categoryRouter = express.Router();
categoryRouter
  .route('/')
  .get(getAllCategory)
  .post(uploadCategoryImage, createCategory);
categoryRouter
  .route('/:id')
  .get(getCategoryById)
  .patch(uploadCategoryImage, updateCategory);

categoryRouter
  .route('/detail/:id')
  .get(getCategory)
categoryRouter
  .route('/:id/status')
  .patch(deleteCategory)

export default categoryRouter;
