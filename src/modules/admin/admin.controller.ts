import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = req.query;
    const result = await adminService.getAllUsers(
        search as string | undefined,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta,
    })
})

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { status } = req.body;

    const result = await adminService.updateUserStatus(userId as string, status as UserStatus);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: result
    })
})

const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllProperties();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result
    })
})

const getAllRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentals();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result
    })
})

const getAdminStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAdminStats();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Admin stats retrieved successfully",
        data: result
    })
})

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals,
    getAdminStats,
}
