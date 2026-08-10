import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { authValidation } from "./auth.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", validate(authValidation.register), authController.registerUser);
router.post("/login", validate(authValidation.login), authController.loginUser);
router.post("/social-login", validate(authValidation.socialLogin), authController.socialLogin);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT), authController.getCurrentUser);
router.patch("/me", auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT), validate(authValidation.updateProfile), authController.updateCurrentUser);

export const authRouter = router;