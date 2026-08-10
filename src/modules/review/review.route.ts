import { Router } from "express";
import { reviewController } from "./review.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { reviewValidation } from "./review.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.TENANT), validate(reviewValidation.createReview), reviewController.createReview);
router.get("/", auth(UserRole.TENANT), reviewController.getMyReviews);

export const reviewRouter = router;
