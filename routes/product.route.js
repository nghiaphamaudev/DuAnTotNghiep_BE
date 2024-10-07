import { Router } from "express";
import { createProduct, deleteProduct, deleteProductStatus, getAllProducts, getProductById, relatedProduct, updateProduct } from "../controllers/product.controller";
import { restrictTo } from "../controllers/auth.controller";
import { uploadProductImages } from "../middlewares/uploadCloud.middleware";

const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.post("/", uploadProductImages, createProduct);
productRouter.get("/:id", getProductById);
productRouter.patch("/:id", uploadProductImages, updateProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:categoryId/related/:productId", relatedProduct);
productRouter.delete("/:id/status", deleteProductStatus);


export default productRouter;