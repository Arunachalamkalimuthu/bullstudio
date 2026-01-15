"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@bullstudio/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@bullstudio/ui/components/alert-dialog";
import { Skeleton } from "@bullstudio/ui/components/skeleton";
import { toast } from "@bullstudio/ui/components/sonner";
import {
  ArrowLeft,
  Copy,
  Play,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { JobStatusBadge, type JobStatus } from "./JobStatusBadge";
import { JobMetadataBar } from "./JobMetadataBar";
import { JobDetailTabs } from "./JobDetailTabs";

interface JobDetailProps {
  workspace: string;
  jobId: string;
}

export function JobDetail({ workspace, jobId }: JobDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId") ?? "";
  const queueName = searchParams.get("queueName") ?? "";

  const utils = trpc.useUtils();

  const {
    data: job,
    isLoading,
    error,
  } = trpc.queue.job.useQuery(
    { connectionId, queueName, jobId },
    { enabled: !!connectionId && !!queueName }
  );

  const retryMutation = trpc.queue.retryJob.useMutation({
    onSuccess: () => {
      toast.success("Job has been queued for retry");
      utils.queue.job.invalidate({ connectionId, queueName, jobId });
    },
    onError: (err) => {
      toast.error(`Failed to retry job: ${err.message}`);
    },
  });

  const removeMutation = trpc.queue.removeJob.useMutation({
    onSuccess: () => {
      toast.success("Job removed successfully");
      router.push(`/${workspace}/jobs`);
    },
    onError: (err) => {
      toast.error(`Failed to remove job: ${err.message}`);
    },
  });

  const handleRetry = () => {
    retryMutation.mutate({ connectionId, queueName, jobId });
  };

  const handleRemove = () => {
    removeMutation.mutate({ connectionId, queueName, jobId });
  };

  const goBack = () => {
    router.push(`/${workspace}/jobs`);
  };

  if (!connectionId || !queueName) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="size-10 text-amber-500 mb-3" />
        <h2 className="text-lg font-semibold text-zinc-200">
          Missing Parameters
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Connection ID and Queue Name are required
        </p>
        <Button onClick={goBack} size="sm" className="mt-4">
          <ArrowLeft className="size-3.5 mr-1.5" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="size-10 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-zinc-200">Job Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {error?.message ?? "The requested job could not be found"}
        </p>
        <Button onClick={goBack} size="sm" className="mt-4">
          <ArrowLeft className="size-3.5 mr-1.5" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const status = job.status as JobStatus;
  const isFailed = status === "failed";
  const isDelayed = status === "delayed";

  return (
    <div className="space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="shrink-0 size-8"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-zinc-100 truncate">
                {job.name}
              </h1>
              <JobStatusBadge status={status} size="sm" />
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate">
              {job.id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-11 sm:ml-0">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-zinc-700 h-8"
          >
            <Copy className="size-3.5 mr-1.5" />
            Clone
          </Button>

          {isDelayed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="border-zinc-700 h-8"
            >
              <Play className="size-3.5 mr-1.5" />
              {retryMutation.isPending ? "Running..." : "Run Now"}
            </Button>
          )}

          {isFailed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="border-zinc-700 h-8"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              {retryMutation.isPending ? "Retrying..." : "Retry"}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 h-8"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this job? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {removeMutation.isPending ? "Removing..." : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Metadata Bar */}
      <JobMetadataBar
        queueName={job.queueName}
        attemptsMade={job.attemptsMade}
        attemptsLimit={job.attemptsLimit || 1}
        priority={job.priority}
        delay={job.delay}
      />

      {/* Tabs */}
      <JobDetailTabs job={job} status={status} />
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
