import {catchAsyncErrors} from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../utils/errorHandler.js'
import {User} from '../models/User.js'
import { sendToken } from '../utils/sendToken.js';

export const register = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;
    // const file = req.file;
    if(!name || !email || !password)
        return next(new ErrorHandler('Please enter all field',400));
    
    let user = await User.findOne({email});

    if(user) return next(new ErrorHandler("User already exits",409));

    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id : "temp",
            url : "tempurl",
        },
    });
    sendToken(res,user,"Registered Successfully",201)
});

export const login = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;
    // const file = req.file;
    if(!email || !password)
        return next(new ErrorHandler('Please enter all field',400));
    
    const user = await User.findOne({email}).select("+password");

    if(!user) return next(new ErrorHandler("Incorrect Email or Password",401));

    const isMatch = await user.comparePassword(password);

    if(!isMatch) 
        return next(new ErrorHandler("Incorrect Email or Password",401));

    sendToken(res,user,`Welcome back ${user.name}`,200);
});

export const logout = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token",null,{
        expires: new Date(Date.now())
    }).json({success:true,message:"Logged Out Successfully"});
});

export const getMyProfile = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user._id);
    res.status(200).json({success:true,user});
});