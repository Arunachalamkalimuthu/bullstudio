import { TRPCError } from "@trpc/server";
import { getConnectionManager } from "@bullstudio/queue";
import type { Job } from "@bullstudio/connect-types";
import type { AuthedTRPCContext } from "../../types";
import type {
  OverviewMetricsInput,
  OverviewMetricsResponse,
  TimeSeriesDataPoint,
  SlowJob,
  FailingJobType,
} from "./overview-metrics.schema";

async function getQueueService(ctx: AuthedTRPCContext, connectionId: string) {
  const { prisma, user } = ctx;

  const connection = await prisma.redisConnection.findUnique({
    where: { id: connectionId },
    include: {
      workspace: {
        include: {
          members: { where: { userId: user.id } },
        },
      },
    },
  });

  if (!connection) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
  }

  if (connection.workspace.members.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this connection",
    });
  }

  const connectionManager = getConnectionManager(prisma);
  const service = await connectionManager.getConnection(connectionId);

  if (!service) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Connection is not available",
    });
  }

  return service;
}

type OverviewMetricsHandlerProps = {
  ctx: AuthedTRPCContext;
  input: OverviewMetricsInput;
};

export async function overviewMetricsHandler({
  ctx,
  input,
}: OverviewMetricsHandlerProps): Promise<OverviewMetricsResponse> {
  const service = await getQueueService(ctx, input.connectionId);

  const allQueues = await service.getQueues();
  const timeRangeMs = input.timeRangeHours * 60 * 60 * 1000;
  const cutoffTimestamp = Date.now() - timeRangeMs;

  // Filter queues if a specific queue is selected
  const queuesToProcess = input.queueName
    ? allQueues.filter((q) => q.name === input.queueName)
    : allQueues;

  const allJobs: Job[] = [];

  for (const queue of queuesToProcess) {
    const [completed, failed] = await Promise.all([
      service.getJobs(queue.name, {
        filter: { status: "completed" },
        sort: { field: "finishedOn", order: "desc" },
        limit: 1000,
      }),
      service.getJobs(queue.name, {
        filter: { status: "failed" },
        sort: { field: "finishedOn", order: "desc" },
        limit: 1000,
      }),
    ]);

    allJobs.push(
      ...completed.filter(
        (j) => j.finishedOn && j.finishedOn >= cutoffTimestamp
      ),
      ...failed.filter((j) => j.finishedOn && j.finishedOn >= cutoffTimestamp)
    );
  }

  return aggregateMetrics(allJobs, input.timeRangeHours, queuesToProcess.length);
}

function aggregateMetrics(
  jobs: Job[],
  timeRangeHours: number,
  queuesCount: number
): OverviewMetricsResponse {
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  const jobsWithProcessingTime = jobs.filter(
    (j) => j.processedOn && j.finishedOn
  );
  const avgProcessingTimeMs =
    jobsWithProcessingTime.length > 0
      ? jobsWithProcessingTime.reduce(
          (sum, j) => sum + (j.finishedOn! - j.processedOn!),
          0
        ) / jobsWithProcessingTime.length
      : 0;

  const jobsWithDelay = jobs.filter((j) => j.processedOn && j.timestamp);
  const avgDelayMs =
    jobsWithDelay.length > 0
      ? jobsWithDelay.reduce(
          (sum, j) => sum + (j.processedOn! - j.timestamp - (j.delay || 0)),
          0
        ) / jobsWithDelay.length
      : 0;

  const timeSeries = buildTimeSeries(jobs, timeRangeHours);
  const slowestJobs = buildSlowestJobs(jobsWithProcessingTime);
  const failingJobTypes = buildFailingJobTypes(failedJobs);

  const totalJobs = completedJobs.length + failedJobs.length;

  return {
    summary: {
      totalCompleted: completedJobs.length,
      totalFailed: failedJobs.length,
      avgThroughputPerHour: totalJobs / timeRangeHours,
      failureRate: totalJobs > 0 ? (failedJobs.length / totalJobs) * 100 : 0,
      avgProcessingTimeMs,
      avgDelayMs: Math.max(0, avgDelayMs),
    },
    timeSeries,
    slowestJobs,
    failingJobTypes,
    queuesCount,
    lastUpdated: Date.now(),
  };
}

function buildTimeSeries(
  jobs: Job[],
  timeRangeHours: number
): TimeSeriesDataPoint[] {
  const hourlyBuckets = new Map<number, Job[]>();
  const now = Date.now();

  for (let i = 0; i < timeRangeHours; i++) {
    const bucketTime = now - i * 60 * 60 * 1000;
    const hourStart =
      Math.floor(bucketTime / (60 * 60 * 1000)) * (60 * 60 * 1000);
    hourlyBuckets.set(hourStart, []);
  }

  for (const job of jobs) {
    if (job.finishedOn) {
      const hourStart =
        Math.floor(job.finishedOn / (60 * 60 * 1000)) * (60 * 60 * 1000);
      const bucket = hourlyBuckets.get(hourStart);
      if (bucket) bucket.push(job);
    }
  }

  return Array.from(hourlyBuckets.entries())
    .map(([timestamp, bucketJobs]) => {
      const completed = bucketJobs.filter(
        (j) => j.status === "completed"
      ).length;
      const failed = bucketJobs.filter((j) => j.status === "failed").length;
      const withTimes = bucketJobs.filter((j) => j.processedOn && j.finishedOn);
      const withDelay = bucketJobs.filter((j) => j.processedOn);

      return {
        timestamp,
        completed,
        failed,
        avgProcessingTimeMs:
          withTimes.length > 0
            ? withTimes.reduce(
                (s, j) => s + (j.finishedOn! - j.processedOn!),
                0
              ) / withTimes.length
            : 0,
        avgDelayMs:
          withDelay.length > 0
            ? Math.max(
                0,
                withDelay.reduce(
                  (s, j) =>
                    s + (j.processedOn! - j.timestamp - (j.delay || 0)),
                  0
                ) / withDelay.length
              )
            : 0,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function buildSlowestJobs(jobs: Job[]): SlowJob[] {
  return jobs
    .map((job) => ({
      id: job.id,
      name: job.name,
      queueName: job.queueName,
      processingTimeMs: job.finishedOn! - job.processedOn!,
      timestamp: job.timestamp,
      status: job.status,
    }))
    .sort((a, b) => b.processingTimeMs - a.processingTimeMs)
    .slice(0, 10);
}

function buildFailingJobTypes(failedJobs: Job[]): FailingJobType[] {
  const grouped = new Map<string, Job[]>();

  for (const job of failedJobs) {
    const key = `${job.queueName}:${job.name}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(job);
  }

  return Array.from(grouped.entries())
    .map(([key, jobs]) => {
      const parts = key.split(":");
      const queueName = parts[0] ?? "";
      const name = parts.slice(1).join(":");
      const sorted = jobs.sort(
        (a, b) => (b.finishedOn || 0) - (a.finishedOn || 0)
      );
      const latest = sorted[0];

      return {
        name,
        queueName,
        failureCount: jobs.length,
        lastFailedAt: latest?.finishedOn || latest?.timestamp || 0,
        lastFailedReason: latest?.failedReason,
      };
    })
    .sort((a, b) => b.failureCount - a.failureCount)
    .slice(0, 10);
}
