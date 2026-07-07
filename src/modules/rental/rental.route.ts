import { Router } from "express";
import { rentalController } from "./rental.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.TENANT), rentalController.createRentalRequest);
router.get("/", auth(UserRole.TENANT), rentalController.getTenantRentalsHistory);
router.get("/:rentalRequestId", auth(UserRole.TENANT), rentalController.getRentalRequestById);
router.patch("/:rentalRequestId", auth(UserRole.TENANT), rentalController.updateRentalRequest);

export const rentalRouter = router;
