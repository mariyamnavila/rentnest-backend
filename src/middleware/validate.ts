import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodSchema, ZodError } from "zod";
import sendResponse from "../utils/sendResponse";

const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                sendResponse(res, {
                    success: false,
                    statusCode: httpStatus.BAD_REQUEST,
                    message: errorMessage.map((e) => e.message).join(", "),
                    data: errorMessage,
                });
            } else {
                next(error);
            }
        }
    };
};

export default validate;