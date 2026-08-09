import { prisma } from "@/config/db";

export const usageService = {
  async getSummary(userId: string) {
    const records = await prisma.usageRecord.findMany({
      where: { userId },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      take: 12,
    });

    const totalUsage = records.reduce((sum, r) => sum + r.usageM3, 0);
    const avgUsage = records.length ? totalUsage / records.length : 0;
    const latest = records[0] ?? null;

    return {
      latest,
      averageMonthlyM3: Number(avgUsage.toFixed(2)),
      last12Months: records,
    };
  },

  async getHistory(userId: string, period: "month" | "year") {
    if (period === "year") {
      const records = await prisma.usageRecord.findMany({
        where: { userId },
        orderBy: { periodYear: "desc" },
      });
      const grouped: Record<number, number> = {};
      for (const r of records) {
        grouped[r.periodYear] = (grouped[r.periodYear] || 0) + r.usageM3;
      }
      return Object.entries(grouped).map(([year, totalM3]) => ({
        year: Number(year),
        totalM3,
      }));
    }

    return prisma.usageRecord.findMany({
      where: { userId },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });
  },
};
