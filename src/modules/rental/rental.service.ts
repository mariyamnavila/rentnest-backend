import { prisma } from "../../lib/prisma";
import { ICreateRentalRequestPayload, TUpdateRentalRequest } from "./rental.interface";
import { RequestStatus } from "../../../generated/prisma/enums";

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

    // Check if the tenant already has an active, pending, or approved request for this property
    const existingActiveRequest = await prisma.rentalRequest.findFirst({
        where: {
            propertyId,
            tenantId,
            status: {
                in: [RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.ACTIVE],
            },
        },
    });

    if (existingActiveRequest) {
        throw new Error(`You already have a ${existingActiveRequest.status.toLowerCase()} rental request for this property.`);
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

const getRentalRequestById = async (id: string, tenantId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
            id,
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
            tenant: {
                omit: {
                    password: true,
                },
            },
            payments: true,
        },
    });

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You do not have permission to view this rental request.");
    }

    return rentalRequest;
}

const updateRentalRequest = async (
    rentalRequestId: string,
    tenantId: string,
    payload: TUpdateRentalRequest
) => {
    const { startDate, endDate, message } = payload;

    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
            id: rentalRequestId,
        },
        include: {
            property: true,
        },
    });

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You do not have permission to update this rental request.");
    }

    if (rentalRequest.status !== RequestStatus.PENDING) {
        throw new Error(`Cannot update a rental request that is already ${rentalRequest.status.toLowerCase()}.`);
    }

    const updateData: any = { message };

    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : rentalRequest.startDate;
        const end = endDate ? new Date(endDate) : rentalRequest.endDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            throw new Error("Start date cannot be in the past.");
        }

        if (end <= start) {
            throw new Error("End date must be after the start date.");
        }

        updateData.startDate = start;
        updateData.endDate = end;
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: {
            id: rentalRequestId,
        },
        data: updateData,
        include: {
            property: true,
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return updatedRequest;
}

export const rentalService = {
    createRentalRequest,
    getTenantRentalsHistory,
    getRentalRequestById,
    updateRentalRequest,
}
