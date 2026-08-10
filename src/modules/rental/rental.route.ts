import { Router } from "express";
import { rentalController } from "./rental.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { rentalValidation } from "./rental.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.TENANT), validate(rentalValidation.createRentalRequest), rentalController.createRentalRequest);
router.get("/stats", auth(UserRole.TENANT), rentalController.getRentalStats);
router.get("/", auth(UserRole.TENANT), rentalController.getTenantRentalsHistory);
router.get("/:rentalRequestId", auth(UserRole.TENANT), validate(rentalValidation.getRentalRequestById), rentalController.getRentalRequestById);
router.patch("/:rentalRequestId", auth(UserRole.TENANT), validate(rentalValidation.updateRentalRequest), rentalController.updateRentalRequest);

export const rentalRouter = router;
