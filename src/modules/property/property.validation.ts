import { z } from "zod";

const createProperty = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
        description: z.string().min(1, "Description is required"),
        location: z.string().min(1, "Location is required"),
        price: z.number().positive("Price must be a positive number"),
        amenities: z.array(z.string()).min(1, "At least one amenity is required"),
        images: z.array(z.url("Please provide a valid URL for images")).min(1, "At least one image is required"),
        categoryId: z.uuid("Please provide a valid category ID"),
    }),
});

const updateProperty = z.object({
    params: z.object({
        propertyId: z.uuid("Please provide a valid property ID"),
    }),
    body: z.object({
        title: z.string().min(1, "Title cannot be empty").max(255, "Title cannot exceed 255 characters").optional(),
        description: z.string().min(1, "Description cannot be empty").optional(),
        location: z.string().min(1, "Location cannot be empty").optional(),
        price: z.number().positive("Price must be a positive number").optional(),
        amenities: z.array(z.string()).optional(),
        images: z.array(z.url("Please provide a valid URL for images")).optional(),
        categoryId: z.uuid("Please provide a valid category ID").optional(),
    }),
});

const updateAvailability = z.object({
    params: z.object({
        propertyId: z.uuid("Please provide a valid property ID"),
    }),
    body: z.object({
        isAvailable: z.boolean(),
    }),
});

const getPropertyQuery = z.object({
    query: z.object({
        limit: z.string().optional(),
        page: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        searchTerm: z.string().optional(),
        location: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        categoryId: z.uuid().optional(),
        category: z.string().optional(),
        amenities: z.string().optional(),
    }),
});

export const propertyValidation = {
    createProperty,
    updateProperty,
    updateAvailability,
    getPropertyQuery,
};