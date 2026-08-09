import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";

export const announcementsService = {
  async list(kebele?: string | null) {
    return prisma.announcement.findMany({
      where: kebele ? { OR: [{ kebele }, { kebele: null }] } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async latest(kebele?: string | null) {
    return prisma.announcement.findFirst({
      where: kebele ? { OR: [{ kebele }, { kebele: null }] } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new AppError("Announcement not found", 404);
    return announcement;
  },
};
