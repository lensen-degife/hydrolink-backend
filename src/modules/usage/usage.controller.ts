import { Request, Response } from "express";
import { usageService } from "@/modules/usage/usage.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const usageController = {
  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const data = await usageService.getSummary(req.user!.userId);
    return sendSuccess(res, data, "Usage summary");
  }),
  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as "month" | "year") || "month";
    const data = await usageService.getHistory(req.user!.userId, period);
    return sendSuccess(res, data, "Usage history");
  }),
};
