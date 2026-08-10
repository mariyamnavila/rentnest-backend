import { Router } from "express";
import { propertyController } from "./property.controller";
import validate from "../../middleware/validate";
import { propertyValidation } from "./property.validation";

const router = Router();

router.get("/", validate(propertyValidation.getPropertyQuery), propertyController.getAllProperties);
router.get("/:propertyId", propertyController.getPropertyById);

export const propertyRouter = router;
