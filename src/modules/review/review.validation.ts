import { z } from "zod";

const createReview = z.object({
    body: z.object({
        propertyId: z.uuid("Please provide a valid property ID"),
        rating: z.int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
        comment: z.string().optional(),
    }),
});

const getPropertyReviews = z.object({
    params: z.object({
        propertyId: z.uuid("Please provide a valid property ID"),
    }),
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const reviewValidation = {
    createReview,
    getPropertyReviews,
};