import { Router } from "express";
import { landlordController } from "./landlord.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/properties", auth(UserRole.LANDLORD), landlordController.createProperty);
router.patch("/properties/:propertyId", auth(UserRole.LANDLORD), landlordController.updateProperty);
router.delete("/properties/:propertyId", auth(UserRole.LANDLORD), landlordController.deleteProperty);
router.patch("/properties/:propertyId/availability", auth(UserRole.LANDLORD), landlordController.updatePropertyAvailability);
router.get("/requests", auth(UserRole.LANDLORD), landlordController.getLandlordRentalRequests);
router.patch("/requests/:rentalRequestId", auth(UserRole.LANDLORD), landlordController.updateRentalRequestStatus);
router.patch("/requests/:rentalRequestId/complete", auth(UserRole.LANDLORD), landlordController.completeRentalRequest);

export const landlordRouter = router;
