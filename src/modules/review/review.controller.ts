import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;

    const result = await reviewService.createReview(payload, tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review submitted successfully",
        data: result
    })
})

const getMyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;

    const result = await reviewService.getMyReviews(tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Reviews fetched successfully",
        data: result
    })
})

export const reviewController = {
    createReview,
    getMyReviews,
}
