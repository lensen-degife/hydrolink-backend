import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { SupplyStatus } from "@prisma/client";

async function getUserKebele(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kebele: true } });
  if (!user?.kebele) {
    throw new AppError("No Kebele is set on your profile yet", 400);
  }
  return user.kebele;
}

export const scheduleService = {
  async getToday(userId: string) {
    const kebele = await getUserKebele(userId);
    const dayOfWeek = new Date().getDay();
    return prisma.schedule.findMany({
      where: { kebele, dayOfWeek },
      orderBy: { startTime: "asc" },
    });
  },

  async getWeekly(userId: string) {
    const kebele = await getUserKebele(userId);
    return prisma.schedule.findMany({
      where: { kebele },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  async getStatus(userId: string) {
    const kebele = await getUserKebele(userId);
    const dayOfWeek = new Date().getDay();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const slots = await prisma.schedule.findMany({
      where: { kebele, dayOfWeek },
    });

    const activeSlot = slots.find(
      (s) => s.startTime <= currentTime && currentTime <= s.endTime
    );

    return {
      kebele,
      status: activeSlot ? activeSlot.status : SupplyStatus.SCHEDULED_OFF,
      activeSlot: activeSlot ?? null,
      checkedAt: now,
    };
  },
};
