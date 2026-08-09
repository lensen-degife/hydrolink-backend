import { env } from "@/config/env";

export function generateOtp(length: number = env.otpLength): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);
}
