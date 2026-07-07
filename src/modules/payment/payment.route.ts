import express, { Router } from "express";
import { paymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create", auth(UserRole.TENANT), paymentController.createCheckoutSession);
router.post("/confirm", paymentController.handleWebhook);
router.get("/", auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN), paymentController.getUserPaymentHistory);
router.get("/:paymentId", auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN), paymentController.getPaymentDetails);

export const paymentRouter = router;
