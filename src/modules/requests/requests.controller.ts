import { Request, Response } from "express";
import { requestsService } from "@/modules/requests/requests.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const requestsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await requestsService.list(req.user!.userId);
    return sendSuccess(res, data, "Service requests");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await requestsService.create(req.user!.userId, req.body);
    return sendSuccess(res, data, "Service request submitted", 201);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const data = await requestsService.getById(req.user!.userId, req.params.id);
    return sendSuccess(res, data, "Service request detail");
  }),

  mine: asyncHandler(async (req: Request, res: Response) => {
    const data = await requestsService.mine(req.user!.userId);
    return sendSuccess(res, data, "My service requests");
  }),
};
