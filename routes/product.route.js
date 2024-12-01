import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  deleteProductStatus,
  getAllProducts,
  getDetailProductById,
  relatedProduct,
  updateProduct,
  getDetailProductBySlug,
  updateVariantStatusById,
} from '../controllers/product.controller';
import { restrictTo } from '../controllers/auth.controller';
import { uploadProductImages } from '../middlewares/uploadCloud.middleware';

const productRouter = Router();

productRouter.get('/', getAllProducts);
productRouter.post('/', uploadProductImages, createProduct);
productRouter.get('/:id', getDetailProductById);
productRouter.get('/slug/:slug', getDetailProductBySlug);
productRouter.put('/:id', uploadProductImages, updateProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.get('/:categoryId/related/:productId', relatedProduct);
productRouter.patch('/:id/status', deleteProductStatus);
productRouter.patch('/:id/update-variants-status/:variantId', updateVariantStatusById);

export default productRouter;
