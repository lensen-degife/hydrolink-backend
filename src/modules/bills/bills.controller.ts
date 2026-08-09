import { Request, Response } from "express";
import { billsService } from "@/modules/bills/bills.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const billsController = {
  getCurrent: asyncHandler(async (req: Request, res: Response) => {
    const bill = await billsService.getCurrent(req.user!.userId);
    return sendSuccess(res, bill, bill ? "Current bill" : "No outstanding bill");
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const result = await billsService.getHistory(req.user!.userId, page, limit);
    return sendSuccess(res, result, "Bill history");
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const bill = await billsService.getById(req.user!.userId, req.params.id);
    return sendSuccess(res, bill, "Bill detail");
  }),

  getReceipt: asyncHandler(async (req: Request, res: Response) => {
    const receipt = await billsService.getReceipt(req.user!.userId, req.params.id);
    return sendSuccess(res, receipt, "Bill receipt");
  }),
};
