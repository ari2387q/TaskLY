import { Request, Response } from "express";
import * as authService from "./auth.service";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

export const register=async(req:Request,res:Response)=>{
  const{email,password}=req.body;
  if(!email || !password){
    return res.status(400).json({message:"email and pass required"})
  }
  try{
    const user=await authService.registerUser({email,password});
    res.status(201).json({
      success: true,
      message: "Signup successful. Please check your email to verify your account.",
      user,
    });
  }
  catch(error){
    if(error instanceof authService.AuthError){
      return res.status(error.statusCode).json({message:"error.message"});
    }
  
  console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try{
  const user = await authService.loginUser({ email, password });

  const token = generateToken(user.id.toString());

  res.status(200).json({
    success: true,
    token,
    user,
  });
  }catch (error) {
    if (error instanceof authService.AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const getProfile = async (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
};
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    const result = await authService.verifyEmail(token);
    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
      email: result.email,
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await authService.resendVerification(email);
    res.status(200).json({
      success: true,
      message: "Verification email resent. Please check your inbox.",
      email: result.email,
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login`);
  }
};
