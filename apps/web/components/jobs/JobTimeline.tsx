"use client";

import { cn } from "@bullstudio/ui/lib/utils";
import { Check, Clock, Loader2, X, Hourglass } from "lucide-react";
import dayjs from "@bullstudio/dayjs";
import type { JobStatus } from "./JobStatusBadge";

interface TimelineStep {
  label: string;
  timestamp?: number;
  status: "completed" | "active" | "pending" | "failed";
  icon: React.ReactNode;
}

interface JobTimelineProps {
  status: JobStatus;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  delay?: number;
  className?: string;
}

export function JobTimeline({
  status,
  timestamp,
  processedOn,
  finishedOn,
  delay,
  className,
}: JobTimelineProps) {
  const steps: TimelineStep[] = [];

  // Step 1: Created
  steps.push({
    label: "Created",
    timestamp,
    status: "completed",
    icon: <Check className="size-3.5" />,
  });

  // Step 2: Delayed (if applicable)
  if (delay && delay > 0) {
    const delayedUntil = timestamp + delay;
    const isStillDelayed = status === "delayed";
    steps.push({
      label: "Delayed",
      timestamp: delayedUntil,
      status: isStillDelayed ? "active" : "completed",
      icon: isStillDelayed ? (
        <Hourglass className="size-3.5 animate-pulse" />
      ) : (
        <Check className="size-3.5" />
      ),
    });
  }

  // Step 3: Processing
  if (processedOn || status === "active") {
    steps.push({
      label: "Processing",
      timestamp: processedOn,
      status: status === "active" ? "active" : "completed",
      icon:
        status === "active" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        ),
    });
  } else if (status !== "waiting" && status !== "delayed") {
    steps.push({
      label: "Processing",
      timestamp: processedOn,
      status: "completed",
      icon: <Check className="size-3.5" />,
    });
  }

  // Step 4: Final state
  if (status === "completed") {
    steps.push({
      label: "Completed",
      timestamp: finishedOn,
      status: "completed",
      icon: <Check className="size-3.5" />,
    });
  } else if (status === "failed") {
    steps.push({
      label: "Failed",
      timestamp: finishedOn,
      status: "failed",
      icon: <X className="size-3.5" />,
    });
  } else if (status === "waiting" || status === "delayed") {
    steps.push({
      label: "Pending",
      status: "pending",
      icon: <Clock className="size-3.5" />,
    });
  }

  const getStepColors = (stepStatus: TimelineStep["status"]) => {
    switch (stepStatus) {
      case "completed":
        return {
          bg: "bg-emerald-500",
          border: "border-emerald-500",
          text: "text-emerald-400",
          line: "bg-emerald-500",
        };
      case "active":
        return {
          bg: "bg-blue-500",
          border: "border-blue-500",
          text: "text-blue-400",
          line: "bg-blue-500/30",
        };
      case "failed":
        return {
          bg: "bg-red-500",
          border: "border-red-500",
          text: "text-red-400",
          line: "bg-red-500",
        };
      case "pending":
        return {
          bg: "bg-zinc-700",
          border: "border-zinc-600",
          text: "text-zinc-500",
          line: "bg-zinc-700",
        };
    }
  };

  return (
    <div className={cn("flex items-start gap-0", className)}>
      {steps.map((step, index) => {
        const colors = getStepColors(step.status);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex items-start flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center size-7 rounded-full border-2",
                  colors.border,
                  colors.bg,
                  "text-white"
                )}
              >
                {step.icon}
              </div>
              <div className="mt-2 text-center">
                <p className={cn("text-xs font-medium", colors.text)}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {dayjs(step.timestamp).format("HH:mm:ss")}
                  </p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mt-3.5 mx-2">
                <div className={cn("h-full rounded-full", colors.line)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
