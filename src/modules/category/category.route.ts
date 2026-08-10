import { Router } from "express";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { categoryValidation } from "./category.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.ADMIN), validate(categoryValidation.createCategory), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.patch("/:categoryId", auth(UserRole.ADMIN), validate(categoryValidation.updateCategory), categoryController.updateCategory);
router.delete("/:categoryId", auth(UserRole.ADMIN), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

export const categoryRouter = router;
