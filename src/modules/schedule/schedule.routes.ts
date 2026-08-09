import { Router } from "express";
import { scheduleController } from "@/modules/schedule/schedule.controller";
import { authGuard } from "@/middlewares/auth";

const router = Router();
router.use(authGuard);

router.get("/today", scheduleController.getToday);
router.get("/weekly", scheduleController.getWeekly);
router.get("/status", scheduleController.getStatus);

export default router;
