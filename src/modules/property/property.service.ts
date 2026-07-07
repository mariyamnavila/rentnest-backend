import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { IPropertyQuery } from "./property.interface";

const getAllProperties = async (query: IPropertyQuery) => {

    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

    const andConditions: Prisma.PropertyWhereInput[] = [];

    // Location search
    if (query.location) {
        andConditions.push({
            location: query.location
        });
    }

    // Price range range
    if (query.minPrice || query.maxPrice) {
        const priceCondition: Prisma.FloatFilter = {};
        if (query.minPrice) {
            priceCondition.gte = Number(query.minPrice);
        }
        if (query.maxPrice) {
            priceCondition.lte = Number(query.maxPrice);
        }
        andConditions.push({
            price: priceCondition,
        });
    }

    // Property category type (by ID)
    if (query.categoryId) {
        andConditions.push({
            categoryId: query.categoryId,
        });
    }

    // Property category type (by Name)
    if (query.category) {
        andConditions.push({
            category: {
                name: query.category,
            },
        });
    }

    // Amenity tags
    if (query.amenities) {
        try {
            const parsedAmenities = JSON.parse(query.amenities);
            const amenitiesArray = Array.isArray(parsedAmenities) ? parsedAmenities : [parsedAmenities];
            if (amenitiesArray.length > 0) {
                andConditions.push({
                    amenities: {
                        hasEvery: amenitiesArray,
                    },
                });
            }
        } catch (e) {
            // If not valid JSON, search as single string tag
            andConditions.push({
                amenities: {
                    has: query.amenities,
                },
            });
        }
    }

    // General Search Term
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    location: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        name: {
                            contains: query.searchTerm,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        });
    }

    // only show available listings
    andConditions.push({
        isAvailable: true,
    });

    const properties = await prisma.property.findMany({
        where: {
            AND: andConditions,
        },
        take: limit,
        skip: skip,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            category: true,
            landlord: {
                omit: {
                    password: true,
                },
            },
            reviews: true,
        },
    });

    const totalProperties = await prisma.property.count({
        where: {
            AND: andConditions,
        },
    });

    return {
        data: properties,
        meta: {
            total: totalProperties,
            page,
            limit,
            totalPages: Math.ceil(totalProperties / limit),
        },
    };
}

export const propertyService = {
    getAllProperties,
}
