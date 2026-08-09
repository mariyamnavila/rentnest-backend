import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/social-login", authController.socialLogin);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT), authController.getCurrentUser);
router.patch("/me", auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT), authController.updateCurrentUser);

export const authRouter = router;