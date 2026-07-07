import { Router } from "express";
import { adminController } from "./admin.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.patch("/users/:userId", auth(UserRole.ADMIN), adminController.updateUserStatus);
router.get("/properties", auth(UserRole.ADMIN), adminController.getAllProperties);
router.get("/rentals", auth(UserRole.ADMIN), adminController.getAllRentals);

export const adminRouter = router;
