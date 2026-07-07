import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const query = req.query;

    const result = await propertyService.getAllProperties(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result.data,
        meta: result.meta,
    })
})

const getPropertyById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { propertyId } = req.params;
    const result = await propertyService.getPropertyById(propertyId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property details retrieved successfully",
        data: result
    })
})

export const propertyController = {
    getAllProperties,
    getPropertyById,
}
