import { Router } from "express";
import { paymentsController } from "@/modules/payments/payments.controller";
import { authGuard } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { createPaymentSchema, paymentIdSchema } from "@/modules/payments/payments.validation";

const router = Router();
router.use(authGuard);

router.post("/", validate(createPaymentSchema), paymentsController.create);
router.get("/history", paymentsController.history);
router.get("/:id", validate(paymentIdSchema), paymentsController.getById);
router.post("/:id/confirm", validate(paymentIdSchema), paymentsController.confirm);

export default router;
