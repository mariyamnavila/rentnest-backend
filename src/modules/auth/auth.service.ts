import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./auth.interface"
import config from "../../config";
import { UserRole } from "../../../generated/prisma/enums";

const registerUserIntoDB = async (payload: IRegisterUser) => {

    const { name, email, password, phone, profileImage, role } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (isUserExist) {
        throw new Error("A user already exists with this email!");
    }

    const allowedRoles: UserRole[] = [UserRole.LANDLORD, UserRole.TENANT];

    if (!allowedRoles.includes(role)) {
        throw new Error("Invalid or missing role!");
    }

    if (!password || password.length < 6) {
        throw new Error("Please provide a 6 characters long password to register!")
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profileImage,
            role,
            phone,
        }
    })

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: createdUser.id,
            email: createdUser.email || email,
        },
        omit: {
            password: true,
        },
    })

    return user;
}

export const authService = {
    registerUserIntoDB,
}