import { z } from "zod";

const createRentalRequest = z.object({
    body: z.object({
        propertyId: z.uuid("Please provide a valid property ID"),
        startDate: z.iso.datetime("Please provide a valid start date format").or(z.iso.date("Please provide a valid start date format")),
        endDate: z.iso.datetime("Please provide a valid end date format").or(z.iso.date("Please provide a valid end date format")),
        message: z.string().optional(),
    }),
});

const updateRentalRequest = z.object({
    params: z.object({
        rentalRequestId: z.uuid("Please provide a valid rental request ID"),
    }),
    body: z.object({
        startDate: z.iso.datetime("Please provide a valid start date format").or(z.iso.date("Please provide a valid start date format")).optional(),
        endDate: z.iso.datetime("Please provide a valid end date format").or(z.iso.date("Please provide a valid end date format")).optional(),
        message: z.string().optional(),
    }),
});

const updateRentalRequestStatus = z.object({
    params: z.object({
        rentalRequestId: z.uuid("Please provide a valid rental request ID"),
    }),
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED"], {
            error: "Status must be either APPROVED or REJECTED",
        }),
    }),
});

const getRentalRequestById = z.object({
    params: z.object({
        rentalRequestId: z.uuid("Please provide a valid rental request ID"),
    }),
});

export const rentalValidation = {
    createRentalRequest,
    updateRentalRequest,
    updateRentalRequestStatus,
    getRentalRequestById,
};