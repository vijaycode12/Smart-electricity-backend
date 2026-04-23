import { Router } from "express";

import { signOut,signUp,logIn,getMe,updateProfile } from "../controllers/auth.controller.js";
import {protect} from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/sign-up',signUp);
authRouter.post('/log-in',logIn);
authRouter.post('/sign-out',signOut);
authRouter.get('/me',protect,getMe);
authRouter.put('/profile',protect,updateProfile);

export default authRouter;