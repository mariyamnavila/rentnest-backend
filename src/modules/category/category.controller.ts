import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    const result = await categoryService.createCategory(name);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category created successfully",
        data: result
    })
})

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await categoryService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: result
    })
})

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    const result = await categoryService.updateCategory(categoryId as string, name);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: result
    })
})

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    await categoryService.deleteCategory(categoryId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: null
    })
})

export const categoryController = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
}
