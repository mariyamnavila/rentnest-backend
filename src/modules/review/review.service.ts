import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";
import { RequestStatus } from "../../../generated/prisma/enums";

const createReview = async (payload: ICreateReviewPayload, tenantId: string) => {
    const { propertyId, rating, comment } = payload;

    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
    }

    await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
        },
    });

    // Count total active or completed rental requests for this property by this tenant
    const eligibleRentalsCount = await prisma.rentalRequest.count({
        where: {
            propertyId,
            tenantId,
            status: { in: [RequestStatus.ACTIVE, RequestStatus.COMPLETED] },
        },
    });

    if (eligibleRentalsCount === 0) {
        throw new Error("You can only review properties where you have an active or completed rental request.");
    }

    // Count total reviews submitted for this property by this tenant
    const reviewsCount = await prisma.review.count({
        where: {
            propertyId,
            tenantId,
        },
    });

    if (reviewsCount >= eligibleRentalsCount) {
        throw new Error("You have already submitted reviews for all your stays of this property.");
    }

    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            propertyId,
            tenantId,
        },
        include: {
            property: true,
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return review;
}

const getMyReviews = async (tenantId: string) => {
    const reviews = await prisma.review.findMany({
        where: {
            tenantId,
        },
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return reviews;
}

export const reviewService = {
    createReview,
    getMyReviews,
}
