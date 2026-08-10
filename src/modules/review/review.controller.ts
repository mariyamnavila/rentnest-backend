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
    const { search, page, limit, rating, sortBy } = req.query;

    const result = await reviewService.getMyReviews(
        tenantId as string,
        search as string | undefined,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        rating ? Number(rating) : undefined,
        sortBy as string | undefined
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Reviews fetched successfully",
        data: result.data,
        meta: result.meta
    })
})

export const reviewController = {
    createReview,
    getMyReviews,
}
