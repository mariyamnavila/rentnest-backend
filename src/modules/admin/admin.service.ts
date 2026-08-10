import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllUsers = async (search?: string, page?: number, limit?: number) => {
    const where: any = {};

    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { role: { contains: q, mode: "insensitive" } },
        ];
    }

    const currentPage = Math.max(1, page || 1);
    const perPage = Math.min(50, Math.max(1, limit || 10));
    const skip = (currentPage - 1) * perPage;

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
        where,
        omit: { password: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
    });

    return {
        users,
        meta: {
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        },
    };
}

const updateUserStatus = async (id: string, status: UserStatus) => {

    if (status !== UserStatus.ACTIVE && status !== UserStatus.BANNED) {
        throw new Error("Invalid status! Status must be ACTIVE or BANNED.");
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!existingUser) {
        throw new Error("User not found.");
    }

    if (status === existingUser.status) {
        throw new Error("User already has this status.")
    }

    const updatedUser = await prisma.user.update({
        where: {
            id,
        },
        data: {
            status,
        },
        omit: {
            password: true,
        },
    });

    return updatedUser;
}

const getAllProperties = async (search?: string, page?: number, limit?: number, categoryId?: string, isAvailable?: string, sortBy?: string) => {
    const where: any = {};

    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { landlord: { name: { contains: q, mode: "insensitive" } } },
        ];
    }

    if (categoryId && categoryId !== 'ALL') {
        where.categoryId = categoryId;
    }

    if (isAvailable === 'AVAILABLE') {
        where.isAvailable = true;
    } else if (isAvailable === 'UNAVAILABLE') {
        where.isAvailable = false;
    }

    const currentPage = Math.max(1, page || 1);
    const perPage = Math.min(50, Math.max(1, limit || 10));
    const skip = (currentPage - 1) * perPage;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'title-asc') orderBy = { title: 'asc' };
    else if (sortBy === 'title-desc') orderBy = { title: 'desc' };

    const total = await prisma.property.count({ where });

    const properties = await prisma.property.findMany({
        where,
        include: {
            category: true,
            landlord: {
                omit: {
                    password: true,
                },
            },
            reviews: true,
        },
        orderBy,
        skip,
        take: perPage,
    });

    return {
        properties,
        meta: {
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        },
    };
}

const getAllRentals = async (search?: string, page?: number, limit?: number, status?: string, sortBy?: string) => {
    const where: any = {};

    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        where.OR = [
            { property: { title: { contains: q, mode: "insensitive" } } },
            { tenant: { name: { contains: q, mode: "insensitive" } } },
            { property: { landlord: { name: { contains: q, mode: "insensitive" } } } },
        ];
    }

    if (status && status !== 'ALL') {
        where.status = status;
    }

    const currentPage = Math.max(1, page || 1);
    const perPage = Math.min(50, Math.max(1, limit || 10));
    const skip = (currentPage - 1) * perPage;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === 'price-asc') orderBy = { property: { price: 'asc' } };
    else if (sortBy === 'price-desc') orderBy = { property: { price: 'desc' } };
    else if (sortBy === 'start-date') orderBy = { startDate: 'asc' };

    const total = await prisma.rentalRequest.count({ where });

    const rentals = await prisma.rentalRequest.findMany({
        where,
        include: {
            tenant: {
                omit: {
                    password: true,
                },
            },
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
            payments: true,
        },
        orderBy,
        skip,
        take: perPage,
    });

    return {
        rentals,
        meta: {
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        },
    };
}

const getAdminStats = async () => {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: UserStatus.ACTIVE } });
    const bannedUsers = await prisma.user.count({ where: { status: UserStatus.BANNED } });
    const totalProperties = await prisma.property.count();
    const activeRentals = await prisma.rentalRequest.count({ where: { status: "ACTIVE" } });
    const totalRevenue = await prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
    });

    return {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalProperties,
        activeRentals,
        totalRevenue: totalRevenue._sum.amount || 0,
    };
}

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals,
    getAdminStats,
}
