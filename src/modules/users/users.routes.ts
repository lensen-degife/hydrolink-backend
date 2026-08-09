import { Router } from "express";
import { usersController } from "@/modules/users/users.controller";
import { authGuard } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { updateMeSchema } from "@/modules/users/users.validation";

const router = Router();
router.use(authGuard);

router.get("/me", usersController.getMe);
router.put("/me", validate(updateMeSchema), usersController.updateMe);
router.get("/me/account", usersController.getMyAccount);

export default router;
