import { Request, Response } from "express";
import { authService } from "@/modules/auth/auth.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    return sendSuccess(
      res,
      user,
      "Registered successfully. An OTP has been sent to your email.",
      201
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, result, "Login successful");
  }),

  sendOtp: asyncHandler(async (req: Request, res: Response) => {
    const { email, purpose } = req.body;
    const result = await authService.sendOtp(email, purpose);
    return sendSuccess(res, result, "OTP sent");
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, purpose } = req.body;
    await authService.verifyOtp(email, otp, purpose);
    return sendSuccess(res, null, "OTP verified successfully");
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return sendSuccess(
      res,
      null,
      "If that email exists, a password reset OTP has been sent"
    );
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    return sendSuccess(res, null, "Password reset successfully");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    return sendSuccess(res, tokens, "Token refreshed");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("refreshToken is required", 400);
    await authService.logout(refreshToken);
    return sendSuccess(res, null, "Logged out successfully");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.userId);
    return sendSuccess(res, user, "Current user");
  }),
};
