import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload } from "./landlord.interface";

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

export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRentalRequests,
}
