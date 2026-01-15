"use client";

import { cn } from "@bullstudio/ui/lib/utils";
import {
  Check,
  Clock,
  Loader2,
  X,
  CircleDot,
  Play,
  Hourglass,
} from "lucide-react";
import dayjs from "@bullstudio/dayjs";
import type { JobStatus } from "./JobStatusBadge";

export interface TimelineEvent {
  id: string;
  type: "created" | "delayed" | "processing" | "completed" | "failed" | "waiting";
  timestamp?: number;
  label: string;
  description: string;
  duration?: number;
  status: "completed" | "active" | "pending" | "failed";
}

interface JobEventTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function JobEventTimeline({ events, className }: JobEventTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const styles = getEventStyles(event.status);
        const Icon = getEventIcon(event.type, event.status);

        return (
          <div key={event.id} className="relative flex gap-3">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[9px] top-5 bottom-0 w-0.5",
                  event.status === "completed" || event.status === "failed"
                    ? styles.line
                    : "bg-zinc-800"
                )}
              />
            )}

            {/* Event dot */}
            <div
              className={cn(
                "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                styles.dot,
                event.status === "active" && "animate-pulse"
              )}
            >
              <Icon className="size-2.5" />
            </div>

            {/* Event content */}
            <div className={cn("flex-1 pb-5", isLast && "pb-0")}>
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium leading-none",
                    styles.text
                  )}
                >
                  {event.label}
                </span>
                {event.timestamp && (
                  <span className="text-[10px] text-zinc-500 font-mono tabular-nums">
                    {dayjs(event.timestamp).format("HH:mm:ss.SSS")}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 mt-1">{event.description}</p>

              {/* Duration indicator */}
              {event.duration !== undefined && event.duration > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px flex-1 bg-zinc-800/50" />
                  <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
                    +{formatDuration(event.duration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getEventStyles(status: TimelineEvent["status"]) {
  switch (status) {
    case "completed":
      return {
        dot: "border-emerald-500 bg-emerald-500/20 text-emerald-400",
        text: "text-emerald-400",
        line: "bg-emerald-500/30",
      };
    case "active":
      return {
        dot: "border-blue-500 bg-blue-500/20 text-blue-400",
        text: "text-blue-400",
        line: "bg-blue-500/30",
      };
    case "failed":
      return {
        dot: "border-red-500 bg-red-500/20 text-red-400",
        text: "text-red-400",
        line: "bg-red-500/30",
      };
    case "pending":
      return {
        dot: "border-zinc-600 bg-zinc-800 text-zinc-500",
        text: "text-zinc-500",
        line: "bg-zinc-800",
      };
  }
}

function getEventIcon(
  type: TimelineEvent["type"],
  status: TimelineEvent["status"]
) {
  if (status === "active" && type === "processing") {
    return Loader2;
  }

  switch (type) {
    case "created":
      return CircleDot;
    case "delayed":
      return status === "active" ? Hourglass : Clock;
    case "processing":
      return status === "completed" ? Check : Play;
    case "completed":
      return Check;
    case "failed":
      return X;
    case "waiting":
      return Clock;
    default:
      return CircleDot;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Helper function to generate timeline events from job data
interface Job {
  id: string;
  name: string;
  queueName: string;
  data: unknown;
  status: JobStatus;
  progress: number | object;
  attemptsMade: number;
  attemptsLimit: number;
  failedReason?: string;
  stacktrace?: string[];
  returnValue?: unknown;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  delay?: number;
  priority?: number;
}

export function generateTimelineEvents(job: Job): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  let prevTimestamp = job.timestamp;

  // 1. Created event (always present)
  events.push({
    id: "created",
    type: "created",
    timestamp: job.timestamp,
    label: "Created",
    description: "Job added to queue",
    duration: 0,
    status: "completed",
  });

  // 2. Delayed event (if job has delay)
  if (job.delay && job.delay > 0) {
    const delayEndTime = job.timestamp + job.delay;
    const isStillDelayed = job.status === "delayed";

    events.push({
      id: "delayed",
      type: "delayed",
      timestamp: isStillDelayed ? undefined : delayEndTime,
      label: isStillDelayed ? "Scheduled" : "Delay Complete",
      description: isStillDelayed
        ? `Waiting until ${dayjs(delayEndTime).format("HH:mm:ss")}`
        : `Waited for ${formatDuration(job.delay)}`,
      duration: job.delay,
      status: isStillDelayed ? "active" : "completed",
    });

    if (!isStillDelayed) {
      prevTimestamp = delayEndTime;
    }
  }

  // 3. Processing event
  if (job.processedOn) {
    const isActive = job.status === "active";
    events.push({
      id: "processing",
      type: "processing",
      timestamp: job.processedOn,
      label: isActive ? "Processing" : "Processed",
      description: isActive
        ? "Worker executing job..."
        : "Worker picked up job",
      duration: job.processedOn - prevTimestamp,
      status: isActive ? "active" : "completed",
    });
    prevTimestamp = job.processedOn;
  } else if (job.status === "waiting") {
    events.push({
      id: "waiting",
      type: "waiting",
      label: "Waiting",
      description: "Queued for processing",
      status: "pending",
    });
  }

  // 4. Final state event
  if (job.status === "completed" && job.finishedOn) {
    events.push({
      id: "completed",
      type: "completed",
      timestamp: job.finishedOn,
      label: "Completed",
      description: "Job finished successfully",
      duration: job.finishedOn - prevTimestamp,
      status: "completed",
    });
  } else if (job.status === "failed" && job.finishedOn) {
    events.push({
      id: "failed",
      type: "failed",
      timestamp: job.finishedOn,
      label: "Failed",
      description:
        job.failedReason?.slice(0, 80) || "Job execution failed",
      duration: job.finishedOn - prevTimestamp,
      status: "failed",
    });
  }

  return events;
}
