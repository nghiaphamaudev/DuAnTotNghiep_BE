import { Router } from "express";
import { createProduct, deleteProduct, deleteProductStatus, getAllProducts, getProductById, relatedProduct, updateProduct } from "../controllers/product.controller";

const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.post("/", createProduct);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:categoryId/related/:productId", relatedProduct);
productRouter.delete("/:id/status", deleteProductStatus);


export default productRouter;