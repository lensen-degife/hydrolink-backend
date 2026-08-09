import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { DevicePlatform } from "@prisma/client";

export const notificationsService = {
  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markRead(userId: string, id: string) {
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new AppError("Notification not found", 404);

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  },

  async registerDevice(userId: string, token: string, platform: "ios" | "android") {
    return prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform: platform.toUpperCase() as DevicePlatform },
      create: { userId, token, platform: platform.toUpperCase() as DevicePlatform },
    });
  },
};
