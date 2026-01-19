"use client";

import { SubscriptionPlan } from "@bullstudio/prisma/browser";
import { Badge } from "@bullstudio/ui/components/badge";
import { cn } from "@bullstudio/ui/lib/utils";

type CurrentPlanBadgeProps = {
  plan: SubscriptionPlan;
  className?: string;
};

const planStyles: Record<SubscriptionPlan, string> = {
  Free: "bg-zinc-800 text-zinc-300 border-zinc-700",
  Pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function CurrentPlanBadge({ plan, className }: CurrentPlanBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", planStyles[plan], className)}
    >
      {plan}
    </Badge>
  );
}
