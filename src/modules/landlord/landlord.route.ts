import { Router } from "express";
import { landlordController } from "./landlord.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { propertyValidation } from "../property/property.validation";
import { rentalValidation } from "../rental/rental.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/stats", auth(UserRole.LANDLORD), landlordController.getLandlordStats);
router.get("/properties", auth(UserRole.LANDLORD), landlordController.getLandlordProperties);
router.post("/properties", auth(UserRole.LANDLORD), validate(propertyValidation.createProperty), landlordController.createProperty);
router.patch("/properties/:propertyId", auth(UserRole.LANDLORD), validate(propertyValidation.updateProperty), landlordController.updateProperty);
router.delete("/properties/:propertyId", auth(UserRole.LANDLORD), landlordController.deleteProperty);
router.patch("/properties/:propertyId/availability", auth(UserRole.LANDLORD), validate(propertyValidation.updateAvailability), landlordController.updatePropertyAvailability);
router.get("/requests", auth(UserRole.LANDLORD), landlordController.getLandlordRentalRequests);
router.patch("/requests/:rentalRequestId", auth(UserRole.LANDLORD), validate(rentalValidation.updateRentalRequestStatus), landlordController.updateRentalRequestStatus);
router.patch("/requests/:rentalRequestId/complete", auth(UserRole.LANDLORD), landlordController.completeRentalRequest);

export const landlordRouter = router;
