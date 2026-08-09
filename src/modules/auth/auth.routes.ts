import { Router } from "express";
import { authController } from "@/modules/auth/auth.controller";
import { validate } from "@/middlewares/validate";
import { authGuard } from "@/middlewares/auth";
import { authRateLimiter } from "@/middlewares/rateLimit";
import {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
} from "@/modules/auth/auth.validation";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/otp/send", authRateLimiter, validate(otpSendSchema), authController.sendOtp);
router.post("/otp/verify", authRateLimiter, validate(otpVerifySchema), authController.verifyOtp);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authGuard, authController.me);

export default router;
