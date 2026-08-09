import { Request, Response } from "express";
import { scheduleService } from "@/modules/schedule/schedule.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const scheduleController = {
  getToday: asyncHandler(async (req: Request, res: Response) => {
    const data = await scheduleService.getToday(req.user!.userId);
    return sendSuccess(res, data, "Today's schedule");
  }),
  getWeekly: asyncHandler(async (req: Request, res: Response) => {
    const data = await scheduleService.getWeekly(req.user!.userId);
    return sendSuccess(res, data, "Weekly schedule");
  }),
  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const data = await scheduleService.getStatus(req.user!.userId);
    return sendSuccess(res, data, "Current supply status");
  }),
};
