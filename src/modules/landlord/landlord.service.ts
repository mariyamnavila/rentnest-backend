import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload } from "./landlord.interface";
import { RequestStatus } from "../../../generated/prisma/enums";

const createProperty = async (payload: ICreatePropertyPayload, landlordId: string) => {
    const { categoryId } = payload;

    // Verify category exists
    await prisma.category.findUniqueOrThrow({
        where: {
            id: categoryId,
        },
    });

    const property = await prisma.property.create({
        data: {
            ...payload,
            landlordId,
        },
        include: {
            category: true,
            landlord: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return property;
}

const updateProperty = async (
    propertyId: string,
    landlordId: string,
    payload: Partial<ICreatePropertyPayload>
) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
        },
    });

    if (property.landlordId !== landlordId) {
        throw new Error("You do not have permission to update this property.");
    }

    if (payload.categoryId) {
        // Verify category exists
        await prisma.category.findUniqueOrThrow({
            where: {
                id: payload.categoryId,
            },
        });
    }

    const updatedProperty = await prisma.property.update({
        where: {
            id: propertyId,
        },
        data: payload,
        include: {
            category: true,
            landlord: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return updatedProperty;
}

const deleteProperty = async (propertyId: string, landlordId: string) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
        },
    });

    if (property.landlordId !== landlordId) {
        throw new Error("You do not have permission to delete this property.");
    }

    const deletedProperty = await prisma.property.delete({
        where: {
            id: propertyId,
        },
    });

    return deletedProperty;
}

const getLandlordRentalRequests = async (landlordId: string) => {
    const requests = await prisma.rentalRequest.findMany({
        where: {
            property: {
                landlordId,
            },
        },
        include: {
            property: {
                include: {
                    category: true,
                },
            },
            tenant: {
                omit: {
                    password: true,
                },
            },
            payments: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return requests;
}

const updateRentalRequestStatus = async (
    requestId: string,
    landlordId: string,
    status: RequestStatus
) => {
    if (status !== RequestStatus.APPROVED && status !== RequestStatus.REJECTED) {
        throw new Error("Invalid status! Landlords can only set status to APPROVED or REJECTED.");
    }

    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
            id: requestId,
        },
        include: {
            property: true,
        },
    });

    if (rentalRequest.property.landlordId !== landlordId) {
        throw new Error("You do not have permission to moderate this rental request.");
    }

    if (rentalRequest.status !== RequestStatus.PENDING) {
        throw new Error(`Cannot update a rental request that is already ${rentalRequest.status.toLowerCase()}.`);
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status,
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

    return updatedRequest;
}

const updatePropertyAvailability = async (
    propertyId: string,
    landlordId: string,
    isAvailable: boolean
) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
        },
    });

    if (property.landlordId !== landlordId) {
        throw new Error("You do not have permission to update this property availability.");
    }

    const updatedProperty = await prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            isAvailable,
        },
        include: {
            category: true,
            landlord: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return updatedProperty;
}

const completeRentalRequest = async (requestId: string, landlordId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
            id: requestId,
        },
        include: {
            property: true,
        },
    });

    if (rentalRequest.property.landlordId !== landlordId) {
        throw new Error("You do not have permission to complete this rental request.");
    }

    if (rentalRequest.status !== RequestStatus.ACTIVE) {
        throw new Error("Only active rental requests can be marked as completed.");
    }

    const today = new Date();

    if (today < rentalRequest.endDate) {
        throw new Error("This rental cannot be completed before the end date.");
    }

    const [updatedRequest] = await prisma.$transaction([
        prisma.rentalRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.COMPLETED,
            },
            include: {
                property: true,
                tenant: {
                    omit: {
                        password: true,
                    },
                },
            },
        }),
        prisma.property.update({
            where: {
                id: rentalRequest.propertyId,
            },
            data: {
                isAvailable: true,
            },
        }),
    ]);

    return updatedRequest;
}

export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRentalRequests,
    updateRentalRequestStatus,
    updatePropertyAvailability,
    completeRentalRequest,
}
