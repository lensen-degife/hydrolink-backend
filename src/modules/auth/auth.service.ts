import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { hashPassword, comparePassword } from "@/utils/password";
import { generateOtp, otpExpiryDate } from "@/utils/otp";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { env } from "@/config/env";
import { OtpPurpose } from "@prisma/client";

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  accountNumber: string;
  password: string;
}

function otpPurposeFromString(purpose: "register" | "reset"): OtpPurpose {
  return purpose === "register" ? OtpPurpose.REGISTER : OtpPurpose.RESET;
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  const expiresAt = new Date();
  // Store refresh token expiry roughly in line with JWT_REFRESH_EXPIRES_IN.
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phone: input.phone },
          { accountNumber: input.accountNumber },
        ],
      },
    });
    if (existing) {
      throw new AppError(
        "A user with this email, phone, or account number already exists",
        409
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        accountNumber: input.accountNumber,
        passwordHash,
      },
    });

    // Immediately issue a registration OTP so the client can move
    // straight into the verification step.
    await authService.sendOtp(user.email, "register");

    return { id: user.id, email: user.email, fullName: user.fullName };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid email or password", 401);

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password", 401);

    if (!user.isActive) throw new AppError("Account is disabled", 403);

    const tokens = await issueTokenPair(user.id, user.email);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        accountNumber: user.accountNumber,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  },

  async sendOtp(email: string, purpose: "register" | "reset") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user && purpose === "reset") {
      // Don't reveal whether the email exists for password resets.
      return;
    }
    if (!user) throw new AppError("User not found", 404);

    const code = generateOtp();
    await prisma.otp.create({
      data: {
        userId: user.id,
        email,
        code,
        purpose: otpPurposeFromString(purpose),
        expiresAt: otpExpiryDate(),
      },
    });

    // In production this would call an SMS/email provider.
    // Logged here so the flow is testable end-to-end without one.
    console.log(`[OTP] ${email} (${purpose}): ${code}`);

    return { expiresInMinutes: env.otpExpiresInMinutes };
  },

  async verifyOtp(email: string, code: string, purpose: "register" | "reset") {
    const otp = await prisma.otp.findFirst({
      where: {
        email,
        code,
        purpose: otpPurposeFromString(purpose),
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) throw new AppError("Invalid or expired OTP", 400);

    await prisma.otp.update({
      where: { id: otp.id },
      data: { consumed: true },
    });

    if (purpose === "register") {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
    }

    return true;
  },

  async forgotPassword(email: string) {
    return authService.sendOtp(email, "reset");
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    await authService.verifyOtp(email, otp, "reset");

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Invalidate all existing sessions for this user.
    await prisma.refreshToken.updateMany({
      where: { user: { email } },
      data: { revoked: true },
    });

    return true;
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError("Refresh token is no longer valid", 401);
    }

    // Rotate: revoke the old token, issue a new pair.
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return issueTokenPair(payload.userId, payload.email);
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    return true;
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      accountNumber: user.accountNumber,
      kebele: user.kebele,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  },
};
