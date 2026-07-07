import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        omit: {
            password: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return users;
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

export const adminService = {
    getAllUsers,
    updateUserStatus,
}
