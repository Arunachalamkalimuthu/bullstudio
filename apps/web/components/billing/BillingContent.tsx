"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { SubscriptionPlan } from "@bullstudio/prisma/browser";
import { Button } from "@bullstudio/ui/components/button";
import { Skeleton } from "@bullstudio/ui/components/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrganizationContext } from "@/components/providers/OrganizationProvider";
import { CurrentPlanBadge } from "./CurrentPlanBadge";
import { UsageDisplay } from "./UsageDisplay";
import { PlanCard } from "./PlanCard";

const PLANS: {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
}[] = [
  {
    plan: "Free",
    name: "Free",
    price: 0,
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
  {
    plan: "Pro",
    name: "Pro",
    price: 39,
    description: "For growing teams with advanced needs",
    features: [
      "5 Workspaces",
      "5 Connections",
      "Everything in Free",
      "Alerts",
      "Premium support",
    ],
  },
  {
    plan: "Enterprise",
    name: "Enterprise",
    price: 99,
    description: "For large organizations",
    features: ["10 Workspaces", "10 Connections", "Everything in Pro"],
  },
];

export function BillingContent() {
  const { orgId } = useOrganizationContext();
  const [upgradingPlan, setUpgradingPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [isManaging, setIsManaging] = useState(false);

  const { data: subscription, isLoading: loadingSubscription } =
    trpc.billing.getSubscription.useQuery({ organizationId: orgId });

  const { data: usage, isLoading: loadingUsage } =
    trpc.billing.getUsage.useQuery({ organizationId: orgId });

  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: () => {
      setUpgradingPlan(null);
    },
  });

  const { refetch: fetchPortalUrl } = trpc.billing.getPortalUrl.useQuery(
    { organizationId: orgId },
    { enabled: false }
  );

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === "Free") return;
    setUpgradingPlan(plan);
    createCheckout.mutate({
      organizationId: orgId,
      plan: plan as "Pro" | "Enterprise",
    });
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const result = await fetchPortalUrl();
      if (result.data?.portalUrl) {
        window.open(result.data.portalUrl, "_blank");
      }
    } finally {
      setIsManaging(false);
    }
  };

  if (loadingSubscription || loadingUsage) {
    return <BillingSkeleton />;
  }

  const currentPlan = subscription?.plan ?? "Free";

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-zinc-100">
                Current Plan
              </h2>
              <CurrentPlanBadge plan={currentPlan} />
            </div>
            <p className="text-zinc-500">
              {subscription?.planDetails.description}
            </p>
          </div>
          {subscription?.subscription && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isManaging}
              className="shrink-0"
            >
              <ExternalLink className="size-4 mr-2" />
              {isManaging ? "Loading..." : "Manage Subscription"}
            </Button>
          )}
        </div>
      </div>

      {/* Usage Section */}
      {usage && (
        <UsageDisplay
          workspaces={usage.workspaces}
          connections={usage.connections}
          alertsEnabled={usage.alertsEnabled}
        />
      )}

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Available Plans
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.plan}
              plan={plan.plan}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              isCurrentPlan={currentPlan === plan.plan}
              isLoading={upgradingPlan === plan.plan || isManaging}
              onUpgrade={() => handleUpgrade(plan.plan)}
              onManage={handleManageSubscription}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-32 w-full bg-zinc-800/50" />
      <Skeleton className="h-48 w-full bg-zinc-800/50" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-80 w-full bg-zinc-800/50" />
        <Skeleton className="h-80 w-full bg-zinc-800/50" />
        <Skeleton className="h-80 w-full bg-zinc-800/50" />
      </div>
    </div>
  );
}
