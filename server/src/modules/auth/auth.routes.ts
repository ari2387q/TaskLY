import { Router } from "express";
import * as authcontroller from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";
import passport from "passport";
import jwt from "jsonwebtoken";
import { loginlimiter, registerLimiter, resendVerificationLimiter } from "../../middlewares/ratelimiting.middleware";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }

      // Generate token using the correct payload key 'id' to match protect middleware
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      // Redirect back to frontend OAuth callback route with the token
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

router.post("/register", registerLimiter, authcontroller.register);
router.post("/login", loginlimiter, authcontroller.login);

router.get("/profile", protect, authcontroller.getProfile);
router.get("/verify-email", authcontroller.verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, authcontroller.resendVerification);

export default router;