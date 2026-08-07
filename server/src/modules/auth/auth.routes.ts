import { Router } from "express";
import * as authcontroller from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";
import passport from "passport";
import jwt from "jsonwebtoken";
import { generateToken } from "./auth.controller";
import { loginlimiter, registerLimiter, resendVerificationLimiter } from "../../middlewares/ratelimiting.middleware";

const router = Router();
// Step 1: kicks off the flow, redirects to Google's consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false,prompt: "select_account",})
);

// Step 2: Google redirects back here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }));
router.post("/register", registerLimiter, authcontroller.register);
router.post("/login", loginlimiter, authcontroller.login);

router.get("/profile", protect, authcontroller.getProfile);
router.get("/verify-email", authcontroller.verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, authcontroller.resendVerification);
export default router;