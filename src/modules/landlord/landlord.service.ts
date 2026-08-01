import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload } from "./landlord.interface";
import { RequestStatus } from "../../../generated/prisma/enums";

const getLandlordProperties = async (landlordId: string) => {
    const properties = await prisma.property.findMany({
        where: {
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
        orderBy: {
            createdAt: "desc",
        },
    });

    return properties;
};

const getLandlordStats = async (landlordId: string) => {
    const totalProperties = await prisma.property.count({
        where: { landlordId },
    });

    const totalRequests = await prisma.rentalRequest.count({
        where: {
            property: { landlordId },
        },
    });

    const pending = await prisma.rentalRequest.count({
        where: {
            property: { landlordId },
            status: RequestStatus.PENDING,
        },
    });

    const approved = await prisma.rentalRequest.count({
        where: {
            property: { landlordId },
            status: RequestStatus.APPROVED,
        },
    });

    const active = await prisma.rentalRequest.count({
        where: {
            property: { landlordId },
            status: RequestStatus.ACTIVE,
        },
    });

    const completed = await prisma.rentalRequest.count({
        where: {
            property: { landlordId },
            status: RequestStatus.COMPLETED,
        },
    });

    const payment = await prisma.payment.aggregate({
        where: {
            rentalRequest: {
                property: { landlordId },
            },
            status: "COMPLETED",
        },
        _sum: {
            amount: true,
        },
    });

    return {
        totalProperties,
        totalRequests,
        pending,
        approved,
        active,
        completed,
        totalEarnings: payment._sum.amount ?? 0,
    };
};

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
        // prisma.property.update({
        //     where: {
        //         id: rentalRequest.propertyId,
        //     },
        //     data: {
        //         isAvailable: true,
        //     },
        // }),
    ]);

    return updatedRequest;
}

export const landlordService = {
    getLandlordProperties,
    getLandlordStats,
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRentalRequests,
    updateRentalRequestStatus,
    updatePropertyAvailability,
    completeRentalRequest,
}
