import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser, IRegisterUser, IUpdateUser } from "./auth.interface"
import config from "../../config";
import { UserRole } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

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

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    if (user.status === "BANNED") {
        throw new Error("Your account has been banned. Please contact support to reactive.")
    }

    if (!user.password) {
        throw new Error("This account was registered using Google login. Please sign in with Google.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password.");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    )

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return { accessToken, refreshToken };
}

const socialLoginUser = async (payload: {
    email: string;
    name: string;
    profileImage?: string;
    provider?: "GOOGLE";
    providerId?: string;
    role?: UserRole;
}) => {
    const { email, name, profileImage, provider, providerId, role } = payload;

    if (!email) {
        throw new Error("Email is required for social login.");
    }

    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (user && user.status === "BANNED") {
        throw new Error("Your account has been banned. Please contact support.");
    }

    if (!user) {
        const userRole = (role === UserRole.LANDLORD || role === UserRole.TENANT) ? role : UserRole.TENANT;
        user = await prisma.user.create({
            data: {
                email,
                name: name || "RentNest User",
                profileImage: profileImage || null,
                role: userRole,
                googleId: provider === "GOOGLE" ? providerId : null,
            },
        });
    } else {
        if (provider === "GOOGLE" && (!user.googleId || !user.profileImage)) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: providerId || user.googleId,
                    profileImage: user.profileImage || profileImage,
                },
            });
        }
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return { user, accessToken, refreshToken };
};

const refreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error)
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        },
    })

    if (user.status === "BANNED") {
        throw new Error("User is blocked")
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    )

    return { accessToken };
}

const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        omit: {
            password: true,
        },
    });

    return user;
}

const updateCurrentUser = async (userId: string, payload: IUpdateUser) => {
    const { name, phone, profileImage } = payload;

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!existingUser) {
        throw new Error("User not found.");
    }

    if (
        name === undefined &&
        phone === undefined &&
        profileImage === undefined
    ) {
        throw new Error("Please provide at least one field to update.");
    }

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            name,
            phone,
            profileImage,
        },
        omit: {
            password: true,
        },
    });

    return user;
}

export const authService = {
    registerUserIntoDB,
    loginUser,
    socialLoginUser,
    refreshToken,
    getCurrentUser,
    updateCurrentUser,
}