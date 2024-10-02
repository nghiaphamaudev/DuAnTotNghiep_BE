import { Router } from 'express';
import { addCategory, deleteCategorySeason, getAllCategorySeason, getCategoriesBySeason, getProductsByCategoryAndSeason, updateCategorySeason } from '../controllers/categorySeason.controler'
const categorySeasonRouter = Router();

categorySeasonRouter.post("/categories/season", addCategory)
categorySeasonRouter.get("/categories/season", getAllCategorySeason);
categorySeasonRouter.get("/categories/season/:season", getCategoriesBySeason);
categorySeasonRouter.get("/categories/:id/season/:season/products", getProductsByCategoryAndSeason);
categorySeasonRouter.delete("/categories/:id", deleteCategorySeason);
categorySeasonRouter.patch("/categories/:id", updateCategorySeason);





export default categorySeasonRouter;

