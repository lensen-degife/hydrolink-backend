import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import { globalRateLimiter } from "@/middlewares/rateLimit";
import { errorHandler, notFoundHandler } from "@/middlewares/errorHandler";

import authRoutes from "@/modules/auth/auth.routes";
import usersRoutes from "@/modules/users/users.routes";
import billsRoutes from "@/modules/bills/bills.routes";
import paymentsRoutes from "@/modules/payments/payments.routes";
import scheduleRoutes from "@/modules/schedule/schedule.routes";
import usageRoutes from "@/modules/usage/usage.routes";
import requestsRoutes from "@/modules/requests/requests.routes";
import announcementsRoutes from "@/modules/announcements/announcements.routes";
import notificationsRoutes from "@/modules/notifications/notifications.routes";

export function createApp(): Application {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(globalRateLimiter);

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "HydroLink API is healthy", data: { uptime: process.uptime() }, error: null });
  });

  const prefix = env.apiPrefix;
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, usersRoutes);
  app.use(`${prefix}/bills`, billsRoutes);
  app.use(`${prefix}/payments`, paymentsRoutes);
  app.use(`${prefix}/schedule`, scheduleRoutes);
  app.use(`${prefix}/usage`, usageRoutes);
  app.use(`${prefix}/requests`, requestsRoutes);
  app.use(`${prefix}/announcements`, announcementsRoutes);
  app.use(`${prefix}/notifications`, notificationsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
