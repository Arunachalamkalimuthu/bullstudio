"use client";

import { Check } from "lucide-react";
import { SubscriptionPlan } from "@bullstudio/prisma/browser";
import { Button } from "@bullstudio/ui/components/button";
import { cn } from "@bullstudio/ui/lib/utils";

type PlanCardProps = {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  isLoading?: boolean;
  onUpgrade?: () => void;
  onManage?: () => void;
};

export function PlanCard({
  plan,
  name,
  price,
  description,
  features,
  isCurrentPlan,
  isLoading,
  onUpgrade,
  onManage,
}: PlanCardProps) {
  const isPro = plan === "Pro";
  const isEnterprise = plan === "Enterprise";
  const isFree = plan === "Free";

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-zinc-900/50 p-6 flex flex-col",
        isPro
          ? "border-blue-500/50 ring-1 ring-blue-500/20"
          : "border-zinc-800",
        isCurrentPlan && "ring-2 ring-green-500/50"
      )}
    >
      {isPro && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1 rounded-full border border-green-500/30">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3
          className={cn(
            "text-xl font-semibold",
            isPro ? "text-blue-400" : isEnterprise ? "text-purple-400" : "text-zinc-100"
          )}
        >
          {name}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-zinc-100">
          ${price}
        </span>
        {price > 0 && (
          <span className="text-zinc-500 ml-1">/month</span>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
            <span className="text-sm text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isCurrentPlan ? (
          isFree ? (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Current Plan
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={onManage}
              disabled={isLoading}
            >
              Manage Subscription
            </Button>
          )
        ) : isFree ? (
          <Button
            variant="outline"
            className="w-full"
            disabled
          >
            Free Tier
          </Button>
        ) : (
          <Button
            className={cn(
              "w-full",
              isPro && "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={onUpgrade}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : `Upgrade to ${name}`}
          </Button>
        )}
      </div>
    </div>
  );
}
