import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { landlordService } from "./landlord.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { RequestStatus } from "../../../generated/prisma/enums";

const getLandlordProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { search, page, limit, categoryId, isAvailable, sortBy } = req.query;

    const result = await landlordService.getLandlordProperties(
        landlordId as string,
        search as string | undefined,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        categoryId as string | undefined,
        isAvailable as string | undefined,
        sortBy as string | undefined
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result.properties,
        meta: result.meta,
    })
})

const getLandlordStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;

    const result = await landlordService.getLandlordStats(landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Stats retrieved successfully",
        data: result
    })
})

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const payload = req.body;

    const result = await landlordService.createProperty(payload, landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property listing created successfully",
        data: result
    })
})

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { propertyId } = req.params;
    const payload = req.body;

    const result = await landlordService.updateProperty(propertyId as string, landlordId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property listing updated successfully",
        data: result
    })
})

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { propertyId } = req.params;

    const result = await landlordService.deleteProperty(propertyId as string, landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property listing removed successfully",
        data: result
    })
})

const getLandlordRentalRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { search, page, limit, status, sortBy } = req.query;

    const result = await landlordService.getLandlordRentalRequests(
        landlordId as string,
        search as string | undefined,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        status as string | undefined,
        sortBy as string | undefined
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result.requests,
        meta: result.meta,
    })
})

const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { rentalRequestId } = req.params;
    const { status } = req.body;

    const result = await landlordService.updateRentalRequestStatus(rentalRequestId as string, landlordId as string, status as RequestStatus);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request status updated successfully",
        data: result
    })
})

const updatePropertyAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { propertyId } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
        throw new Error("isAvailable must be a boolean value.");
    }

    const result = await landlordService.updatePropertyAvailability(propertyId as string, landlordId as string, isAvailable);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property availability status updated successfully",
        data: result
    })
})

const completeRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const { rentalRequestId } = req.params;

    const result = await landlordService.completeRentalRequest(rentalRequestId as string, landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request marked as completed successfully",
        data: result
    })
})

export const landlordController = {
    getLandlordProperties,
    getLandlordStats,
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRentalRequests,
    updateRentalRequestStatus,
    updatePropertyAvailability,
    completeRentalRequest,
}
