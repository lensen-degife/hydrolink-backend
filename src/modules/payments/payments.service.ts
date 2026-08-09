import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { BillStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

function toPaymentMethod(method: string): PaymentMethod {
  return method.toUpperCase() as PaymentMethod;
}

export const paymentsService = {
  async create(userId: string, billId: string, amount: number, method: string) {
    const bill = await prisma.bill.findFirst({ where: { id: billId, userId } });
    if (!bill) throw new AppError("Bill not found", 404);
    if (bill.status === BillStatus.PAID) {
      throw new AppError("This bill has already been paid", 400);
    }

    // Payment starts PENDING; a separate "confirm" step (simulating a
    // provider callback) marks it SUCCESS or FAILED.
    const payment = await prisma.payment.create({
      data: {
        userId,
        billId,
        amountEtb: amount,
        method: toPaymentMethod(method),
        status: PaymentStatus.PENDING,
        transactionRef: `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      },
    });

    return payment;
  },

  async history(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { bill: { select: { periodMonth: true, periodYear: true } } },
    });
  },

  async getById(userId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { bill: true },
    });
    if (!payment) throw new AppError("Payment not found", 404);
    return payment;
  },

  // Simulates a payment provider callback confirming success/failure.
  async confirm(userId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId } });
    if (!payment) throw new AppError("Payment not found", 404);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError("Payment has already been processed", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const confirmedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
      });

      const bill = await tx.bill.findUnique({ where: { id: payment.billId } });
      if (bill) {
        const totalPaid = await tx.payment.aggregate({
          where: { billId: bill.id, status: PaymentStatus.SUCCESS },
          _sum: { amountEtb: true },
        });
        const paidSoFar = Number(totalPaid._sum.amountEtb ?? 0);
        const newStatus =
          paidSoFar >= Number(bill.amountEtb) ? BillStatus.PAID : BillStatus.PARTIAL;

        await tx.bill.update({
          where: { id: bill.id },
          data: { status: newStatus },
        });
      }

      return confirmedPayment;
    });

    return updated;
  },
};
