import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { BillStatus } from "@prisma/client";

export const billsService = {
  async getCurrent(userId: string) {
    const bill = await prisma.bill.findFirst({
      where: { userId, status: { in: [BillStatus.UNPAID, BillStatus.OVERDUE, BillStatus.PARTIAL] } },
      orderBy: { dueDate: "desc" },
    });
    if (!bill) return null;
    return bill;
  },

  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.bill.findMany({
        where: { userId },
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
        skip,
        take: limit,
      }),
      prisma.bill.count({ where: { userId } }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(userId: string, billId: string) {
    const bill = await prisma.bill.findFirst({ where: { id: billId, userId } });
    if (!bill) throw new AppError("Bill not found", 404);
    return bill;
  },

  async getReceipt(userId: string, billId: string) {
    const bill = await prisma.bill.findFirst({
      where: { id: billId, userId },
      include: {
        payments: {
          where: { status: "SUCCESS" },
          orderBy: { paidAt: "desc" },
        },
        user: {
          select: { fullName: true, accountNumber: true, kebele: true },
        },
      },
    });
    if (!bill) throw new AppError("Bill not found", 404);

    return {
      billId: bill.id,
      period: `${bill.periodMonth}/${bill.periodYear}`,
      customer: bill.user,
      amountEtb: bill.amountEtb,
      status: bill.status,
      dueDate: bill.dueDate,
      payments: bill.payments,
    };
  },
};
