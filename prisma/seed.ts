import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.upsert({
        where: {
            email: "admin@rentnest.com",
        },
        update: {},
        create: {
            name: "Admin",
            email: "admin@rentnest.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log("✅ Admin seeded");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });