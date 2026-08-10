import { z } from "zod";

const createCategory = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required").max(100, "Category name cannot exceed 100 characters"),
    }),
});

const updateCategory = z.object({
    params: z.object({
        categoryId: z.uuid("Please provide a valid category ID"),
    }),
    body: z.object({
        name: z.string().min(1, "Category name is required").max(100, "Category name cannot exceed 100 characters"),
    }),
});

const deleteCategory = z.object({
    params: z.object({
        categoryId: z.uuid("Please provide a valid category ID"),
    }),
});

export const categoryValidation = {
    createCategory,
    updateCategory,
    deleteCategory,
};