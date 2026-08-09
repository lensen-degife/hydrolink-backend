import { Request, Response } from "express";
import { usersService } from "@/modules/users/users.service";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const usersController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getMe(req.user!.userId);
    return sendSuccess(res, user, "Current user profile");
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateMe(req.user!.userId, req.body);
    return sendSuccess(res, user, "Profile updated");
  }),

  getMyAccount: asyncHandler(async (req: Request, res: Response) => {
    const account = await usersService.getMyAccount(req.user!.userId);
    return sendSuccess(res, account, "Account details");
  }),
};
