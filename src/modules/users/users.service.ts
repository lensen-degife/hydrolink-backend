import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";

export const usersService = {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    const { passwordHash, ...safe } = user;
    return safe;
  },

  async updateMe(userId: string, data: { fullName?: string; phone?: string; kebele?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    const { passwordHash, ...safe } = user;
    return safe;
  },

  async getMyAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountNumber: true,
        kebele: true,
        fullName: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
