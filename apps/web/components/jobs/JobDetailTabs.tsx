"use client";

import { useMemo } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@bullstudio/ui/components/tabs";
import { cn } from "@bullstudio/ui/lib/utils";
import { AlertTriangle, Code, FileOutput, Clock } from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import type { JobStatus } from "./JobStatusBadge";
import { JobEventTimeline, generateTimelineEvents } from "./JobEventTimeline";
import { StackTraceViewer } from "./JsonViewer";

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

interface JobDetailTabsProps {
  job: Job;
  status: JobStatus;
  className?: string;
}

// Custom theme to match zinc color palette
const customDarkTheme = {
  ...darkTheme,
  "--w-rjv-background-color": "transparent",
  "--w-rjv-border-left-color": "rgb(63, 63, 70)", // zinc-700
  "--w-rjv-color": "rgb(212, 212, 216)", // zinc-300
  "--w-rjv-key-string": "rgb(167, 139, 250)", // violet-400
  "--w-rjv-type-string-color": "rgb(52, 211, 153)", // emerald-400
  "--w-rjv-type-int-color": "rgb(96, 165, 250)", // blue-400
  "--w-rjv-type-float-color": "rgb(96, 165, 250)", // blue-400
  "--w-rjv-type-boolean-color": "rgb(251, 191, 36)", // amber-400
  "--w-rjv-type-null-color": "rgb(113, 113, 122)", // zinc-500
  "--w-rjv-curlybraces-color": "rgb(161, 161, 170)", // zinc-400
  "--w-rjv-brackets-color": "rgb(161, 161, 170)", // zinc-400
  "--w-rjv-colon-color": "rgb(113, 113, 122)", // zinc-500
  "--w-rjv-ellipsis-color": "rgb(113, 113, 122)", // zinc-500
  "--w-rjv-arrow-color": "rgb(113, 113, 122)", // zinc-500
} as React.CSSProperties;

export function JobDetailTabs({ job, status, className }: JobDetailTabsProps) {
  const isFailed = status === "failed";
  const isCompleted = status === "completed";
  const hasOutput = isCompleted && job.returnValue !== undefined;
  const hasError = isFailed && job.failedReason;

  const timelineEvents = useMemo(() => generateTimelineEvents(job), [job]);

  // Determine default tab - show error for failed jobs, otherwise payload
  const defaultTab = hasError ? "error" : "payload";

  return (
    <Tabs defaultValue={defaultTab} className={cn("w-full", className)}>
      <TabsList className="bg-zinc-900 border border-zinc-800 h-8 w-auto">
        <TabsTrigger value="payload" className="text-xs px-3 gap-1.5">
          <Code className="size-3" />
          Payload
        </TabsTrigger>

        {hasOutput && (
          <TabsTrigger value="output" className="text-xs px-3 gap-1.5">
            <FileOutput className="size-3" />
            Output
          </TabsTrigger>
        )}

        {hasError && (
          <TabsTrigger
            value="error"
            className="text-xs px-3 gap-1.5 data-[state=active]:text-red-400"
          >
            <AlertTriangle className="size-3" />
            Error
          </TabsTrigger>
        )}

        <TabsTrigger value="timeline" className="text-xs px-3 gap-1.5">
          <Clock className="size-3" />
          Timeline
        </TabsTrigger>
      </TabsList>

      {/* Payload Tab */}
      <TabsContent value="payload" className="mt-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="p-3 overflow-auto max-h-[500px]">
            <JsonView
              value={job.data as object}
              style={customDarkTheme}
              displayDataTypes={false}
              displayObjectSize={false}
              collapsed={2}
            />
          </div>
        </div>
      </TabsContent>

      {/* Output Tab */}
      {hasOutput && (
        <TabsContent value="output" className="mt-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-3 overflow-auto max-h-[500px]">
              <JsonView
                value={job.returnValue as object}
                style={customDarkTheme}
                displayDataTypes={false}
                displayObjectSize={false}
                collapsed={2}
              />
            </div>
          </div>
        </TabsContent>
      )}

      {/* Error Tab */}
      {hasError && (
        <TabsContent value="error" className="mt-3 space-y-3">
          {/* Error Message */}
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3">
            <p className="text-[10px] text-red-500/70 uppercase tracking-wide mb-1.5">
              Error Message
            </p>
            <p className="text-sm text-red-300 font-mono leading-relaxed">
              {job.failedReason}
            </p>
          </div>

          {/* Stack Trace */}
          {job.stacktrace && job.stacktrace.length > 0 && (
            <StackTraceViewer stacktrace={job.stacktrace} />
          )}
        </TabsContent>
      )}

      {/* Timeline Tab */}
      <TabsContent value="timeline" className="mt-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
          <JobEventTimeline events={timelineEvents} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
