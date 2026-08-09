import { Request, Response } from "express";
import { paymentsService } from "@/modules/payments/payments.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const paymentsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { billId, amount, method } = req.body;
    const payment = await paymentsService.create(req.user!.userId, billId, amount, method);
    return sendSuccess(res, payment, "Payment initiated", 201);
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const payments = await paymentsService.history(req.user!.userId);
    return sendSuccess(res, payments, "Payment history");
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.getById(req.user!.userId, req.params.id);
    return sendSuccess(res, payment, "Payment detail");
  }),

  confirm: asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.confirm(req.user!.userId, req.params.id);
    return sendSuccess(res, payment, "Payment confirmed");
  }),
};
