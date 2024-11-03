import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  addItemToCart,
  decreaseProductQuantity,
  increaseProductQuantity,
  removeCartItem,
  getCartDetails,
  updateProductQuantity,
} from '../controllers/cart.controller';

const cartRouter = Router();

cartRouter.post('/add', addItemToCart);
cartRouter.get('/get-cart-detail', protect, getCartDetails);
cartRouter.delete('/', removeCartItem);
cartRouter.patch('/', updateProductQuantity);
cartRouter.post('/increase', increaseProductQuantity);
cartRouter.post('/decrease', decreaseProductQuantity);


export default cartRouter;
