import { z } from "zod";

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notification id"),
  }),
});

export const registerDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(5, "Device token is required"),
    platform: z.enum(["ios", "android"]),
  }),
});
