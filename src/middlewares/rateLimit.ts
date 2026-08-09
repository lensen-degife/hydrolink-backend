import rateLimit from "express-rate-limit";
import { env } from "@/config/env";

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    data: null,
    error: "RATE_LIMITED",
  },
});

// Tighter limiter for sensitive auth endpoints (login, OTP, etc.)
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
    data: null,
    error: "RATE_LIMITED",
  },
});
