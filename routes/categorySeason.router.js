import { Router } from 'express';
import { addCategory, deleteCategorySeason, getAllCategorySeason, getCategoriesBySeason, getProductsByCategory, updateCategorySeason } from '../controllers/categorySeason.controler'
const categorySeasonRouter = Router();

categorySeasonRouter.post("/categories/season", addCategory)
categorySeasonRouter.get("/categories/season", getAllCategorySeason);
categorySeasonRouter.get("/categories/season/:season", getCategoriesBySeason);
categorySeasonRouter.get("/categories/season/products/:id", getProductsByCategory);
categorySeasonRouter.delete("/categories/:id", deleteCategorySeason);
categorySeasonRouter.patch("/categories/:id", updateCategorySeason);




export default categorySeasonRouter;
