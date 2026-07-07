import { Router } from "express";
import { landlordController } from "./landlord.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/properties", auth(UserRole.LANDLORD), landlordController.createProperty);
router.patch("/properties/:id", auth(UserRole.LANDLORD), landlordController.updateProperty);
router.patch("/properties/:id/availability", auth(UserRole.LANDLORD), landlordController.updatePropertyAvailability);
router.delete("/properties/:id", auth(UserRole.LANDLORD), landlordController.deleteProperty);
router.get("/requests", auth(UserRole.LANDLORD), landlordController.getLandlordRentalRequests);
router.patch("/requests/:id", auth(UserRole.LANDLORD), landlordController.updateRentalRequestStatus);
router.patch("/requests/:id/complete", auth(UserRole.LANDLORD), landlordController.completeRentalRequest);

export const landlordRouter = router;
