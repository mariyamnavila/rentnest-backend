import { z } from "zod";

const register = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
        email: z.email("Please provide a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        role: z.enum(["LANDLORD", "TENANT"], {
            error: "Role must be either LANDLORD or TENANT",
        }),
        phone: z.string().max(50, "Phone number cannot exceed 50 characters").optional(),
        profileImage: z.url("Please provide a valid URL for profile image").optional(),
    }),
});

const login = z.object({
    body: z.object({
        email: z.email("Please provide a valid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

const socialLogin = z.object({
    body: z.object({
        email: z.email("Please provide a valid email address"),
        name: z.string().min(1, "Name is required"),
        profileImage: z.url("Please provide a valid URL for profile image").optional(),
        provider: z.enum(["GOOGLE"]).optional(),
        providerId: z.string().optional(),
        role: z.enum(["LANDLORD", "TENANT"]).optional(),
    }),
});

const updateProfile = z.object({
    body: z.object({
        name: z.string().min(1, "Name cannot be empty").max(255, "Name cannot exceed 255 characters").optional(),
        phone: z.string().max(50, "Phone number cannot exceed 50 characters").optional(),
        profileImage: z.url("Please provide a valid URL for profile image").optional(),
    }),
});

export const authValidation = {
    register,
    login,
    socialLogin,
    updateProfile,
};