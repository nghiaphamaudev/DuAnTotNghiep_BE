import express from 'express';
import { Register, Login, Protect } from '../controllers/auth.controller';
const userRouter = express.Router({ mergeParams: true });

userRouter.post('/register', Register);
userRouter.post('/login', Login);
userRouter.get('/protect', Protect);

export default userRouter;
