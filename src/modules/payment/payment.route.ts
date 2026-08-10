import express, { Router } from "express";
import { paymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { paymentValidation } from "./payment.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create", auth(UserRole.TENANT), validate(paymentValidation.createCheckoutSession), paymentController.createCheckoutSession);
router.post("/confirm", paymentController.handleWebhook);
router.get("/", auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN), validate(paymentValidation.getPaymentHistory), paymentController.getUserPaymentHistory);
router.get("/:paymentId", auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN), validate(paymentValidation.getPaymentDetails), paymentController.getPaymentDetails);

export const paymentRouter = router;
