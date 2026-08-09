import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    billId: z.string().uuid("Invalid bill id"),
    amount: z.number().positive("Amount must be positive"),
    method: z.enum(["telebirr", "cbe", "awash", "cash", "other"]),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment id"),
  }),
});
