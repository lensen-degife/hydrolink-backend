import { Router } from "express";
import { requestsController } from "@/modules/requests/requests.controller";
import { authGuard } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { createRequestSchema, requestIdSchema } from "@/modules/requests/requests.validation";

const router = Router();
router.use(authGuard);

router.get("/", requestsController.list);
router.post("/", validate(createRequestSchema), requestsController.create);
router.get("/my", requestsController.mine);
router.get("/:id", validate(requestIdSchema), requestsController.getById);

export default router;
