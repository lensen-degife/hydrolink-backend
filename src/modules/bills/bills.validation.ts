import { z } from "zod";

export const listBillsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
  body: z.any().optional(),
});

export const billIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bill id"),
  }),
});
