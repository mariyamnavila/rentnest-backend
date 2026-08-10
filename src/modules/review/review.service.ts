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

const getMyReviews = async (
    tenantId: string,
    search?: string,
    page: number = 1,
    limit: number = 5,
    rating?: number,
    sortBy: string = "newest"
) => {
    const skip = (page - 1) * limit;

    const where: any = {
        tenantId,
    };

    if (search) {
        where.property = {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ],
        };
    }

    if (rating && rating !== 0) {
        where.rating = rating;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "rating-desc") {
        orderBy = { rating: "desc" };
    } else if (sortBy === "rating-asc") {
        orderBy = { rating: "asc" };
    } else if (sortBy === "oldest") {
        orderBy = { createdAt: "asc" };
    }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        price: true,
                        images: true,
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: reviews,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    };
}

export const reviewService = {
    createReview,
    getMyReviews,
}
