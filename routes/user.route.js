import express from 'express';
import { Register, Login } from '../controllers/auth.controller';
const userRouter = express.Router({ mergeParams: true });

userRouter.post('/register', Register);
userRouter.post('/login', Login);

export default userRouter;
