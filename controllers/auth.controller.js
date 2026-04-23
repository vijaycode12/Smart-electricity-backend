import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import {JWT_SECRET,JWT_EXPIRES_IN} from '../config/env.js';

export const signUp = async(req,res,next)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const {username,email,password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode=409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUsers = await User.create([{username,email,password:hashedPassword}],{session});

        const token = jwt.sign({userId:newUsers[0]._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success:true,
            message:'User created successfully',
            data:{
                token,
                user:newUsers[0],
            }
        })
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const logIn = async(req,res,next)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            const error = new Error("Email and password are required to enter");
            error.statusCode=400;
            throw error;
        }

        const user = await User.findOne({email});

        if(!user){
            const error = new Error("User does not exists");
            error.statusCode=404;
            throw error;
        }

        if(!user.password){
            const error = new Error("Password not set for this user");
            error.statusCode=500;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            const error = new Error("Password is incorrect");
            error.statusCode=401;
            throw error;
        }

        const token = jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:'none',
            maxAge:1000*60*60*24,
        });

        res.status(200).json({
            success:true,
            message:'User logged in successfully',
            data:{
                token,
                user,
            }
        });
    }catch(error){
        next(error);
    }
}

export const signOut = async(req,res,next)=>{

    res.clearCookie('token');
    // res.cookie('token',{
    //     httpOnly:true,
    //     secure:false,
    //     sameSite:'none',
    //     path:'/',
    // });

    try{
        res.status(200).json({
            success:true,
            message:'Signed Out successfully'
        });
}catch(error){
    next(error);
}
}

export const getMe = async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            success:false,
            message:'Unauthorized'
        });
    }

    return res.json({
        success:true,
        user:{
            username:req.user.username,
            email:req.user.email
        },
    })
} 

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { username, email, currentPassword, newPassword } = req.body

    const user = await User.findById(userId).select('+password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (username) user.username = username
    if (email)    user.email    = email

    if (currentPassword && newPassword) {
      const bcrypt = await import('bcryptjs')
      const isValid = await bcrypt.default.compare(currentPassword, user.password)
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        })
      }

      const salt    = await bcrypt.default.genSalt(10)
      user.password = await bcrypt.default.hash(newPassword, salt)
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { username: user.username, email: user.email }
    })

  } catch (error) {
    next(error)
  }
}