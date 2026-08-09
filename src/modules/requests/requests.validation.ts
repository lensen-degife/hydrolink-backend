import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    type: z.enum([
      "LEAK",
      "NO_SUPPLY",
      "LOW_PRESSURE",
      "METER_ISSUE",
      "BILLING_ISSUE",
      "OTHER",
    ]),
    description: z.string().min(5, "Please describe the issue"),
    location: z.string().optional(),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  }),
});

export const requestIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid request id"),
  }),
});
