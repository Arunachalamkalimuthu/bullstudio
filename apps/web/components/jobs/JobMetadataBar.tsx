"use client";

import { cn } from "@bullstudio/ui/lib/utils";

interface JobMetadataBarProps {
  queueName: string;
  attemptsMade: number;
  attemptsLimit: number;
  priority?: number;
  delay?: number;
  className?: string;
}

export function JobMetadataBar({
  queueName,
  attemptsMade,
  attemptsLimit,
  priority,
  delay,
  className,
}: JobMetadataBarProps) {
  const items = [
    { label: "Queue", value: queueName, mono: true },
    { label: "Attempts", value: `${attemptsMade} / ${attemptsLimit}` },
    { label: "Priority", value: priority ?? "Default" },
    { label: "Delay", value: delay ? formatDelay(delay) : "None" },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-lg",
        "bg-zinc-900/30 border border-zinc-800",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-zinc-700 mr-2 hidden sm:inline">•</span>
          )}
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
            {item.label}
          </span>
          <span
            className={cn(
              "text-xs text-zinc-200",
              item.mono && "font-mono"
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatDelay(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  return `${Math.floor(ms / 3600000)}h`;
}
