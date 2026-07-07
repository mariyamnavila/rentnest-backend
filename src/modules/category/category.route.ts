import { Router } from "express";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.patch("/:categoryId", auth(UserRole.ADMIN), categoryController.updateCategory);
router.delete("/:categoryId", auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRouter = router;
