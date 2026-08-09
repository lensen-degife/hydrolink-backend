import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(9, "Invalid phone number"),
    accountNumber: z.string().min(3, "Account number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const otpSendSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    purpose: z.enum(["register", "reset"]),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().min(4),
    purpose: z.enum(["register", "reset"]),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().min(4),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10, "Refresh token is required"),
  }),
});
