import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  addItemToCart,
  decreaseProductQuantity,
  increaseProductQuantity,
  removeCartItem,
  getCartDetails,
  updateProductQuantity,
  getCartByUser,
} from '../controllers/cart.controller';

const cartRouter = Router();

cartRouter.use(protect);

cartRouter.post('/add', addItemToCart);
cartRouter.get('/get-cart-detail', getCartDetails);
cartRouter.delete('/', removeCartItem);
cartRouter.get('/', getCartByUser);
cartRouter.patch('/', updateProductQuantity);
cartRouter.patch('/increase', getCartByUser, increaseProductQuantity);
cartRouter.patch('/decrease', decreaseProductQuantity);

export default cartRouter;
