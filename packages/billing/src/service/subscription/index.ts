import { prisma, SubscriptionPlan } from "@bullstudio/prisma";
import { polar } from "../../client";
import { getPlanFeatures, PLAN_FEATURES } from "../../plans";
import { ensureCustomer } from "../customer";

// Note: We use `polar` for the customer portal session creation

export type SubscriptionDetails = {
  plan: SubscriptionPlan;
  planDetails: {
    name: string;
    price: number;
    description: string;
    features: string[];
  };
  subscription: {
    id: string;
    polarSubscriptionId: string;
    periodEndsAt: Date | null;
  } | null;
  polarCustomerId: string | null;
};

export async function getSubscriptionDetails(
  orgId: string
): Promise<SubscriptionDetails> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      subscriptionPlan: true,
      polarCustomerId: true,
      subscription: {
        select: {
          id: true,
          polarSubscriptionId: true,
          periodEndsAt: true,
        },
      },
    },
  });

  if (!org) {
    throw new Error(`Organization with id ${orgId} not found`);
  }

  const planFeatures = getPlanFeatures(org.subscriptionPlan);

  return {
    plan: org.subscriptionPlan,
    planDetails: {
      name: planFeatures.name,
      price: planFeatures.price,
      description: planFeatures.description,
      features: planFeatures.features,
    },
    subscription: org.subscription,
    polarCustomerId: org.polarCustomerId,
  };
}

export async function createCheckoutUrl(
  orgId: string,
  targetPlan: SubscriptionPlan
): Promise<string> {
  const planFeatures = PLAN_FEATURES[targetPlan];

  if (!planFeatures.polarProductId) {
    throw new Error(`Plan ${targetPlan} does not have a Polar product ID`);
  }

  const customerId = await ensureCustomer({ orgId });

  // Build checkout URL using the existing checkout endpoint
  // The Checkout helper from @polar-sh/nextjs expects products and customerId as query params
  const params = new URLSearchParams({
    products: planFeatures.polarProductId,
    customerId: customerId,
  });

  return `/api/billing/checkout?${params.toString()}`;
}

export async function getCustomerPortalUrl(orgId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { polarCustomerId: true },
  });

  if (!org) {
    throw new Error(`Organization with id ${orgId} not found`);
  }

  if (!org.polarCustomerId) {
    throw new Error("Organization does not have a Polar customer ID");
  }

  const session = await polar.customerSessions.create({
    customerId: org.polarCustomerId,
  });

  return session.customerPortalUrl;
}

export async function getAllPlans() {
  return Object.entries(PLAN_FEATURES).map(([plan, features]) => ({
    plan: plan as SubscriptionPlan,
    ...features,
  }));
}
