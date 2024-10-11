import { Router } from 'express';
import { addItemToCart, getUserCart } from '../controllers/cart.controller';


const cartRouter = Router();

cartRouter.post('/add', addItemToCart);
cartRouter.get('/:userId', getUserCart);


export default cartRouter;

