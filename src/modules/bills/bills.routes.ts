import { Router } from "express";
import { billsController } from "@/modules/bills/bills.controller";
import { authGuard } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { billIdSchema, listBillsSchema } from "@/modules/bills/bills.validation";

const router = Router();
router.use(authGuard);

router.get("/current", billsController.getCurrent);
router.get("/history", validate(listBillsSchema), billsController.getHistory);
router.get("/:id", validate(billIdSchema), billsController.getById);
router.get("/:id/receipt", validate(billIdSchema), billsController.getReceipt);

export default router;
