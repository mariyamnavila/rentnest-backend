import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const { rentalRequestId } = req.body;

    if (!rentalRequestId) {
        throw new Error("rentalRequestId is required.");
    }

    const result = await paymentService.createCheckoutSession(rentalRequestId as string, tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Stripe checkout session created successfully",
        data: result
    })
})

const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"];
    const rawBody = req.body;

    if (!signature) {
        throw new Error("Missing stripe-signature header.");
    }

    const result = await paymentService.handleWebhook(rawBody, signature as string);

    res.status(httpStatus.OK).json(result);
})

const getUserPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await paymentService.getUserPaymentHistory(userId as string, role as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result
    })
})

const getPaymentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { paymentId } = req.params;

    const result = await paymentService.getPaymentDetails(paymentId as string, userId as string, role as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details retrieved successfully",
        data: result
    })
})

export const paymentController = {
    createCheckoutSession,
    handleWebhook,
    getUserPaymentHistory,
    getPaymentDetails,
}
