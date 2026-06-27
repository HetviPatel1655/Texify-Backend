import { prisma } from "../lib/prisma";
import { razorpay } from "../config/razorpay";
import { env } from "../config/env";
import { AppError } from "../common/errors/appError";
import type { CreateSubscriptionDto, CancelSubscriptionDto } from "./subscriptions.types";
import crypto from "crypto";

export const SubscriptionsService = {
  async getSubscription(tenantId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    return subscription;
  },

  async createSubscription(tenantId: string, dto: CreateSubscriptionDto) {
    const existing = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existing?.status === "ACTIVE") {
      throw new AppError("Tenant already has an active subscription", 400);
    }

    const companyProfile = await prisma.companyProfile.findUnique({
      where: { tenantId },
    });

    let razorpayCustomerId = existing?.razorpayCustomerId ?? null;

    if (!razorpayCustomerId) {
      const customer = await razorpay.customers.create({
        name: companyProfile?.companyName ?? "Texify User",
        email: companyProfile?.email ?? undefined,
        contact: companyProfile?.phone ?? undefined,
      });
      razorpayCustomerId = customer.id;
    }

    const razorpaySub = await razorpay.subscriptions.create({
      plan_id: dto.planId,
      total_count: 120,
      customer_notify: 1,
    } as any);

    const subscription = await prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        razorpaySubscriptionId: razorpaySub.id,
        razorpayCustomerId,
        razorpayPlanId: dto.planId,
        planName: "pro",
        status: "CREATED",
      },
      update: {
        razorpaySubscriptionId: razorpaySub.id,
        razorpayCustomerId,
        razorpayPlanId: dto.planId,
        planName: "pro",
        status: "CREATED",
        cancelledAt: null,
        cancelAtCycleEnd: false,
      },
    });

    return {
      subscription,
      razorpaySubscriptionId: razorpaySub.id,
      razorpayKeyId: env.RAZORPAY_API_KEY,
    };
  },

  async verifySubscription(tenantId: string, dto: { razorpayPaymentId: string; razorpaySubscriptionId: string; razorpaySignature: string }) {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new AppError("No subscription found", 404);
    }

    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(dto.razorpayPaymentId + "|" + dto.razorpaySubscriptionId)
      .digest("hex");

    if (generatedSignature !== dto.razorpaySignature) {
      throw new AppError("Payment verification failed", 400);
    }

    const razorpaySub = await razorpay.subscriptions.fetch(dto.razorpaySubscriptionId);

    const updated = await prisma.subscription.update({
      where: { tenantId },
      data: {
        status: (razorpaySub as any).status === "active" ? "ACTIVE" : "AUTHENTICATED",
        currentPeriodStart: (razorpaySub as any).current_start
          ? new Date((razorpaySub as any).current_start * 1000)
          : undefined,
        currentPeriodEnd: (razorpaySub as any).current_end
          ? new Date((razorpaySub as any).current_end * 1000)
          : undefined,
      },
    });

    await prisma.subscriptionPayment.upsert({
      where: { razorpayPaymentId: dto.razorpayPaymentId },
      create: {
        subscriptionId: subscription.id,
        razorpayPaymentId: dto.razorpayPaymentId,
        amount: (razorpaySub as any).plan?.item?.amount ? (razorpaySub as any).plan.item.amount / 100 : 0,
        currency: (razorpaySub as any).plan?.item?.currency ?? "INR",
        status: "captured",
        paidAt: new Date(),
      },
      update: {
        status: "captured",
        paidAt: new Date(),
      },
    });

    return updated;
  },

  async cancelSubscription(tenantId: string, dto: CancelSubscriptionDto) {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription?.razorpaySubscriptionId) {
      throw new AppError("No active subscription found", 404);
    }

    if (subscription.status !== "ACTIVE" && subscription.status !== "AUTHENTICATED") {
      throw new AppError("Subscription is not active", 400);
    }

    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, dto.cancelAtCycleEnd);

    const updated = await prisma.subscription.update({
      where: { tenantId },
      data: {
        status: dto.cancelAtCycleEnd ? "ACTIVE" : "CANCELLED",
        cancelAtCycleEnd: dto.cancelAtCycleEnd ?? true,
        cancelledAt: dto.cancelAtCycleEnd ? null : new Date(),
      },
    });

    return updated;
  },

  async handleWebhook(rawBody: string, signature: string) {
    const secret = env.RAZORPAY_WEBHOOK_SECRET ?? env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event as string;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    if (!subscriptionEntity) return;

    const razorpaySubId = subscriptionEntity.id as string;

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: razorpaySubId },
    });

    if (!subscription) return;

    switch (event) {
      case "subscription.authenticated":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "AUTHENTICATED" },
        });
        break;

      case "subscription.activated":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: subscriptionEntity.current_start
              ? new Date(subscriptionEntity.current_start * 1000)
              : undefined,
            currentPeriodEnd: subscriptionEntity.current_end
              ? new Date(subscriptionEntity.current_end * 1000)
              : undefined,
          },
        });
        break;

      case "subscription.charged": {
        const paymentEntity = payload.payload?.payment?.entity;
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: subscriptionEntity.current_start
              ? new Date(subscriptionEntity.current_start * 1000)
              : undefined,
            currentPeriodEnd: subscriptionEntity.current_end
              ? new Date(subscriptionEntity.current_end * 1000)
              : undefined,
          },
        });

        if (paymentEntity) {
          await prisma.subscriptionPayment.upsert({
            where: { razorpayPaymentId: paymentEntity.id },
            create: {
              subscriptionId: subscription.id,
              razorpayPaymentId: paymentEntity.id,
              amount: paymentEntity.amount / 100,
              currency: paymentEntity.currency ?? "INR",
              status: paymentEntity.status ?? "captured",
              paidAt: new Date(),
            },
            update: {
              status: paymentEntity.status ?? "captured",
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "subscription.halted":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "HALTED" },
        });
        break;

      case "subscription.cancelled":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
        break;

      case "subscription.paused":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "PAUSED" },
        });
        break;

      case "subscription.resumed":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE" },
        });
        break;

      case "subscription.completed":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "COMPLETED",
            currentPeriodEnd: new Date(),
          },
        });
        break;

      case "subscription.pending":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "PENDING" },
        });
        break;
    }
  },
};
