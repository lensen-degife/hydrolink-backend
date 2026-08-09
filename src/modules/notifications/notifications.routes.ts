import { Router } from "express";
import { notificationsController } from "@/modules/notifications/notifications.controller";
import { authGuard } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import {
  notificationIdSchema,
  registerDeviceSchema,
} from "@/modules/notifications/notifications.validation";

const router = Router();
router.use(authGuard);

router.get("/", notificationsController.list);
router.put("/read-all", notificationsController.markAllRead);
router.put("/:id/read", validate(notificationIdSchema), notificationsController.markRead);
router.post("/devices", validate(registerDeviceSchema), notificationsController.registerDevice);

export default router;
