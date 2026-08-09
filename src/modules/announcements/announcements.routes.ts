import { Router } from "express";
import { announcementsController } from "@/modules/announcements/announcements.controller";
import { authGuard } from "@/middlewares/auth";

const router = Router();
// Announcements are readable by any authenticated user.
router.use(authGuard);

router.get("/", announcementsController.list);
router.get("/latest", announcementsController.latest);
router.get("/:id", announcementsController.getById);

export default router;
