import { z } from "zod";

const createCheckoutSession = z.object({
    body: z.object({
        rentalRequestId: z.uuid("Please provide a valid rental request ID"),
    }),
});

const getPaymentHistory = z.object({
    query: z.object({
        search: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        status: z.string().optional(),
        sortBy: z.enum(["amount-asc", "amount-desc"]).optional(),
    }),
});

const getPaymentDetails = z.object({
    params: z.object({
        paymentId: z.uuid("Please provide a valid payment ID"),
    }),
});

export const paymentValidation = {
    createCheckoutSession,
    getPaymentHistory,
    getPaymentDetails,
};