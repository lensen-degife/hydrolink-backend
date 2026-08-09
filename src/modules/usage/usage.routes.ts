import { Router } from "express";
import { usageController } from "@/modules/usage/usage.controller";
import { authGuard } from "@/middlewares/auth";

const router = Router();
router.use(authGuard);

router.get("/summary", usageController.getSummary);
router.get("/history", usageController.getHistory);

export default router;
