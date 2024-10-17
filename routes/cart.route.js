import { Router } from 'express';
import { addItemToCart, decreaseProductQuantity, getUserCart, increaseProductQuantity, removeCartItem, updateProductQuantity } from '../controllers/cart.controller';


const cartRouter = Router();

cartRouter.post('/add', addItemToCart);
cartRouter.get('/:userId', getUserCart);
cartRouter.delete('/', removeCartItem);
cartRouter.patch('/', updateProductQuantity);
cartRouter.post('/increase', increaseProductQuantity);
cartRouter.post('/decrease', decreaseProductQuantity);



export default cartRouter;

