import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { RequestType, Urgency } from "@prisma/client";

interface CreateRequestInput {
  type: RequestType;
  description: string;
  location?: string;
  urgency: Urgency;
}

export const requestsService = {
  // GET / — all requests for the account's Kebele context could be added;
  // for now, scoped to the requesting user (see also `.mine`).
  async list(userId: string) {
    return prisma.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(userId: string, input: CreateRequestInput) {
    return prisma.serviceRequest.create({
      data: {
        userId,
        type: input.type,
        description: input.description,
        location: input.location,
        urgency: input.urgency,
      },
    });
  },

  async getById(userId: string, id: string) {
    const request = await prisma.serviceRequest.findFirst({ where: { id, userId } });
    if (!request) throw new AppError("Service request not found", 404);
    return request;
  },

  async mine(userId: string) {
    return prisma.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
};
