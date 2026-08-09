import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const landlordPassword = await bcrypt.hash("landlord123", 10);
    const tenantPassword = await bcrypt.hash("tenant123", 10);

    // Admin
    await prisma.user.upsert({
        where: { email: "admin@rentnest.com" },
        update: {},
        create: {
            name: "System Admin",
            email: "admin@rentnest.com",
            password: adminPassword,
            role: "ADMIN",
        },
    });

    // Landlord
    await prisma.user.upsert({
        where: { email: "landlord@rentnest.com" },
        update: {},
        create: {
            name: "Demo Landlord",
            email: "landlord@rentnest.com",
            password: landlordPassword,
            role: "LANDLORD",
        },
    });

    // Tenant
    await prisma.user.upsert({
        where: { email: "tenant@rentnest.com" },
        update: {},
        create: {
            name: "Demo Tenant",
            email: "tenant@rentnest.com",
            password: tenantPassword,
            role: "TENANT",
        },
    });

    console.log("✅ Demo accounts seeded (Admin, Landlord, Tenant)");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });