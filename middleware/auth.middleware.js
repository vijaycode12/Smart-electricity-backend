import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import {JWT_SECRET} from '../config/env.js';

export const protect = async(req,res,next)=>{
    try{
        let token;

        token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Invalid token or unauthorized'
            })
        }

        const decoded = jwt.verify(token,JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if(!user) return res.status(401).json({message:'Unauthorized'});

        req.user=user;

        next();
    }catch(error){
        res.status(401).json({
            success:false,
            message:'Unauthorized for this action',
            error:error.message
        });
    }
}