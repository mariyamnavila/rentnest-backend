import { prisma } from "../../lib/prisma";
import { ICreateRentalRequestPayload } from "./rental.interface";

const createRentalRequest = async (payload: ICreateRentalRequestPayload, tenantId: string) => {
    const { propertyId, startDate, endDate, message } = payload;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    // removing time from today
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        throw new Error("Start date cannot be in the past.");
    }

    if (end <= start) {
        throw new Error("End date must be after the start date.");
    }

    // Retrieve property
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
        },
    });

    if (!property.isAvailable) {
        throw new Error("This property is currently not available for rent.");
    }

    if (property.landlordId === tenantId) {
        throw new Error("Landlords cannot submit rental requests for their own properties.");
    }

    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            startDate: start,
            endDate: end,
            message,
            tenantId,
            propertyId,
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

    return rentalRequest;
}

const getTenantRentalsHistory = async (tenantId: string) => {
    const rentals = await prisma.rentalRequest.findMany({
        where: {
            tenantId,
        },
        include: {
            property: {
                include: {
                    category: true,
                    landlord: {
                        omit: {
                            password: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return rentals;
}

export const rentalService = {
    createRentalRequest,
    getTenantRentalsHistory,
}
