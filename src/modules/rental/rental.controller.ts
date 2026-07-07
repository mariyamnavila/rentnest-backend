import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;

    const result = await rentalService.createRentalRequest(payload, tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request submitted successfully",
        data: result
    })
})

const getTenantRentalsHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;

    const result = await rentalService.getTenantRentalsHistory(tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests history retrieved successfully",
        data: result
    })
})

const getRentalRequestById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const { rentalRequestId } = req.params;

    const result = await rentalService.getRentalRequestById(rentalRequestId as string, tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request details retrieved successfully",
        data: result
    })
})

const updateRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const { rentalRequestId } = req.params;
    const payload = req.body;

    const result = await rentalService.updateRentalRequest(rentalRequestId as string, tenantId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request updated successfully",
        data: result
    })
})

export const rentalController = {
    createRentalRequest,
    getTenantRentalsHistory,
    getRentalRequestById,
    updateRentalRequest,
}
