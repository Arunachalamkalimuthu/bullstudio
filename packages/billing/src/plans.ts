import { SubscriptionPlan } from "@bullstudio/prisma";

export type PlanLimits = {
  workspaces: number;
  connections: number;
  alertsEnabled: boolean;
};

export type PlanFeatures = {
  name: string;
  price: number;
  polarProductId: string | null;
  description: string;
  features: string[];
};

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  Free: { workspaces: 1, connections: 1, alertsEnabled: false },
  Pro: { workspaces: 5, connections: 5, alertsEnabled: true },
  Enterprise: { workspaces: 10, connections: 10, alertsEnabled: true },
};

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  Free: {
    name: "Free",
    price: 0,
    polarProductId: null,
    description: "Get started with basic queue monitoring",
    features: [
      "1 Workspace",
      "1 Connection",
      "Monitoring",
      "Job insights",
      "Analytics",
      "Basic support",
    ],
  },
  Pro: {
    name: "Pro",
    price: 39,
    polarProductId: "1fdeb20f-a853-4a23-8463-2d685e01eabd",
    description: "For growing teams with advanced needs",
    features: [
      "5 Workspaces",
      "5 Connections",
      "Everything in Free",
      "Alerts",
      "Premium support",
    ],
  },
  Enterprise: {
    name: "Enterprise",
    price: 99,
    polarProductId: "2ce34776-ba89-4441-b9a9-f9a22f0c3be7",
    description: "For large organizations",
    features: ["10 Workspaces", "10 Connections", "Everything in Pro"],
  },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan];
}

export function getPlanByProductId(
  productId: string
): SubscriptionPlan | null {
  for (const [plan, features] of Object.entries(PLAN_FEATURES)) {
    if (features.polarProductId === productId) {
      return plan as SubscriptionPlan;
    }
  }
  return null;
}
