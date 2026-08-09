import { Request, Response } from "express";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationsService.list(req.user!.userId);
    return sendSuccess(res, data, "Notifications");
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationsService.markRead(req.user!.userId, req.params.id);
    return sendSuccess(res, data, "Notification marked as read");
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(req.user!.userId);
    return sendSuccess(res, null, "All notifications marked as read");
  }),

  registerDevice: asyncHandler(async (req: Request, res: Response) => {
    const { token, platform } = req.body;
    const data = await notificationsService.registerDevice(req.user!.userId, token, platform);
    return sendSuccess(res, data, "Device registered for push notifications", 201);
  }),
};
