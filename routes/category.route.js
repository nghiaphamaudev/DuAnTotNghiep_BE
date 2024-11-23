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
  .delete(deleteCategory)
  .patch(uploadCategoryImage, updateCategory);

categoryRouter
  .route('/detail/:id')
  .get(getCategory)

export default categoryRouter;
