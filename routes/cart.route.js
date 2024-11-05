import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  addItemToCart,
  // increaseProductQuantity,
  removeCartItem,
  getCartDetails,
  updateProductQuantity,
  changeQuantityCart,
  getCartByUser,
} from '../controllers/cart.controller';

const cartRouter = Router();

cartRouter.use(protect);

cartRouter.post('/add', addItemToCart);
cartRouter.get('/get-cart-detail', getCartDetails);
cartRouter.delete('/', getCartByUser, removeCartItem);
cartRouter.get('/', getCartByUser);
cartRouter.patch('/', updateProductQuantity);
cartRouter.patch('/change-quantity-cart', getCartByUser, changeQuantityCart);
// cartRouter.patch('/decrease', decreaseProductQuantity);

export default cartRouter;
