import { Router } from "express";
import { rentalController } from "./rental.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.TENANT), rentalController.createRentalRequest);
router.get("/", auth(UserRole.TENANT), rentalController.getTenantRentalsHistory);

export const rentalRouter = router;
