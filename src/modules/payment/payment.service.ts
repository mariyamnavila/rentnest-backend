import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { PaymentMethod, PaymentStatus, RequestStatus } from "../../../generated/prisma/enums";
import Stripe from "stripe";

const createCheckoutSession = async (rentalRequestId: string, tenantId: string) => {
    // 1. Retrieve the rental request
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
            id: rentalRequestId,
        },
        include: {
            property: true,
            tenant: true,
        },
    });

    // 2. Authorization and status checks
    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You do not have permission to pay for this rental request.");
    }

    if (rentalRequest.status !== RequestStatus.APPROVED) {
        throw new Error(`Cannot pay for a rental request that has status ${rentalRequest.status.toLowerCase()}.`);
    }

    // 3. Cost calculation (months * monthly property price)
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const start = new Date(rentalRequest.startDate);
    const end = new Date(rentalRequest.endDate);

    // +1 if you want both start and end dates to be charged
    const totalDays =
        Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);

    const dailyRate = rentalRequest.property.price / 30;

    const amount = Number((dailyRate * totalDays).toFixed(2));

    // 4. Create Stripe checkout session
    const appUrl = config.app_url || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/payment/cancel`,
        customer_email: rentalRequest.tenant.email,
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: rentalRequest.property.title,
                        description: `Rental from ${rentalRequest.startDate.toLocaleDateString()} to ${rentalRequest.endDate.toLocaleDateString()}`,
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            rentalRequestId,
            tenantId,
        },
    });

    // 5. Create a local pending payment record
    const payment = await prisma.payment.create({
        data: {
            transactionId: session.id,
            amount: amount,
            method: PaymentMethod.STRIPE,
            status: PaymentStatus.PENDING,
            rentalRequestId,
            tenantId,
        },
    });

    return {
        checkoutUrl: session.url,
        payment,
    };
}

const handleWebhook = async (rawBody: string | Buffer, signature: string) => {
    const webhookSecret = config.stripe_webhook_secret;
    if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is missing.");
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
        throw new Error(`Webhook Signature verification failed: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const rentalRequestId = session.metadata?.rentalRequestId;
        const tenantId = session.metadata?.tenantId;

        if (!rentalRequestId || !tenantId) {
            throw new Error("Missing metadata in Stripe Checkout Session.");
        }

        const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
            where: {
                id: rentalRequestId,
            },
        });

        await prisma.$transaction([
            prisma.payment.update({
                where: {
                    transactionId: session.id,
                },
                data: {
                    status: PaymentStatus.COMPLETED,
                    paidAt: new Date(),
                },
            }),
            prisma.rentalRequest.update({
                where: {
                    id: rentalRequestId,
                },
                data: {
                    status: RequestStatus.ACTIVE,
                },
            }),
            // prisma.property.update({
            //     where: {
            //         id: rentalRequest.propertyId,
            //     },
            //     data: {
            //         isAvailable: false,
            //     },
            // }),
        ]);
    }

    return { received: true };
}

const getUserPaymentHistory = async (userId: string, role: string, search?: string, page?: number, limit?: number, status?: string, sortBy?: string) => {
    const andConditions: any[] = [];

    if (role === "TENANT") {
        andConditions.push({ tenantId: userId });
    } else if (role === "LANDLORD") {
        andConditions.push({
            rentalRequest: {
                property: {
                    landlordId: userId,
                },
            },
        });
    }

    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        andConditions.push({
            OR: [
                { rentalRequest: { property: { title: { contains: q, mode: "insensitive" } } } },
                { rentalRequest: { property: { location: { contains: q, mode: "insensitive" } } } },
            ],
        });
    }

    if (status && status !== 'ALL') {
        andConditions.push({ status });
    }

    const currentPage = Math.max(1, page || 1);
    const perPage = Math.min(50, Math.max(1, limit || 10));
    const skip = (currentPage - 1) * perPage;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "newest") {
        orderBy = { createdAt: "desc" };
    } else if (sortBy === "oldest") {
        orderBy = { createdAt: "asc" };
    } else if (sortBy === "amount-asc") {
        orderBy = { amount: "asc" };
    } else if (sortBy === "amount-desc") {
        orderBy = { amount: "desc" };
    }

    const total = await prisma.payment.count({
        where: {
            AND: andConditions,
        },
    });

    const payments = await prisma.payment.findMany({
        where: {
            AND: andConditions,
        },
        include: {
            rentalRequest: {
                include: {
                    property: true,
                },
            },
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
        orderBy,
        skip,
        take: perPage,
    });

    return {
        payments,
        meta: {
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        },
    };
}

const getPaymentDetails = async (id: string, userId: string, role: string) => {
    const payment = await prisma.payment.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            rentalRequest: {
                include: {
                    property: true,
                },
            },
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
    });

    if (role === "TENANT" && payment.tenantId !== userId) {
        throw new Error("You do not have permission to view this payment.");
    } else if (role === "LANDLORD" && payment.rentalRequest.property.landlordId !== userId) {
        throw new Error("You do not have permission to view this payment.");
    }

    return payment;
}

export const paymentService = {
    createCheckoutSession,
    handleWebhook,
    getUserPaymentHistory,
    getPaymentDetails,
}
