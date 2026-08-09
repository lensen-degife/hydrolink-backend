import { Request, Response } from "express";
import { announcementsService } from "@/modules/announcements/announcements.service";
import { prisma } from "@/config/db";
import { sendSuccess } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

async function getRequesterKebele(userId?: string) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kebele: true } });
  return user?.kebele ?? null;
}

export const announcementsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const kebele = await getRequesterKebele(req.user?.userId);
    const data = await announcementsService.list(kebele);
    return sendSuccess(res, data, "Announcements");
  }),

  latest: asyncHandler(async (req: Request, res: Response) => {
    const kebele = await getRequesterKebele(req.user?.userId);
    const data = await announcementsService.latest(kebele);
    return sendSuccess(res, data, "Latest announcement");
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const data = await announcementsService.getById(req.params.id);
    return sendSuccess(res, data, "Announcement detail");
  }),
};
