"use client";

import { Progress } from "@bullstudio/ui/components/progress";
import { cn } from "@bullstudio/ui/lib/utils";

type UsageItemProps = {
  label: string;
  current: number;
  limit: number;
};

function UsageItem({ label, current, limit }: UsageItemProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span
          className={cn(
            "font-medium",
            isAtLimit
              ? "text-red-400"
              : isNearLimit
                ? "text-yellow-400"
                : "text-zinc-200"
          )}
        >
          {current} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isAtLimit
            ? "[&>div]:bg-red-500"
            : isNearLimit
              ? "[&>div]:bg-yellow-500"
              : "[&>div]:bg-blue-500"
        )}
      />
    </div>
  );
}

type UsageDisplayProps = {
  workspaces: {
    current: number;
    limit: number;
  };
  connections: {
    current: number;
    limit: number;
  };
  alertsEnabled: boolean;
};

export function UsageDisplay({
  workspaces,
  connections,
  alertsEnabled,
}: UsageDisplayProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        Current Usage
      </h3>
      <div className="space-y-4">
        <UsageItem
          label="Workspaces"
          current={workspaces.current}
          limit={workspaces.limit}
        />
        <UsageItem
          label="Connections"
          current={connections.current}
          limit={connections.limit}
        />
        <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-800">
          <span className="text-zinc-400">Alerts</span>
          <span
            className={cn(
              "font-medium",
              alertsEnabled ? "text-green-400" : "text-zinc-500"
            )}
          >
            {alertsEnabled ? "Enabled" : "Not available"}
          </span>
        </div>
      </div>
    </div>
  );
}
