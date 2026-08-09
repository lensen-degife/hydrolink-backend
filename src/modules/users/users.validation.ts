import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(9).optional(),
    kebele: z.string().optional(),
  }),
});
