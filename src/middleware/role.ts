import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { UserRole } from "../../generated/prisma/enums";

const role = (...requiredRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                statusCode: httpStatus.UNAUTHORIZED,
                message: "You are not logged in. Please log in to access this resource",
            });
        }

        if (requiredRoles.length && !requiredRoles.includes(user.role)) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                statusCode: httpStatus.FORBIDDEN,
                message: "Forbidden. You don't have permission to access this resource.",
            });
        }

        next();
    };
};

export default role;