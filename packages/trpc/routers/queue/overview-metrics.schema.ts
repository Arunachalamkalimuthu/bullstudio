import { z } from "zod";

export const overviewMetricsSchema = z.object({
  connectionId: z.string(),
  timeRangeHours: z.number().min(1).max(168).default(24),
  queueName: z.string().optional(),
});

export type OverviewMetricsInput = z.infer<typeof overviewMetricsSchema>;

export type TimeSeriesDataPoint = {
  timestamp: number;
  completed: number;
  failed: number;
  avgProcessingTimeMs: number;
  avgDelayMs: number;
};

export type SlowJob = {
  id: string;
  name: string;
  queueName: string;
  processingTimeMs: number;
  timestamp: number;
  status: string;
};

export type FailingJobType = {
  name: string;
  queueName: string;
  failureCount: number;
  lastFailedAt: number;
  lastFailedReason?: string;
};

export type OverviewMetricsResponse = {
  summary: {
    totalCompleted: number;
    totalFailed: number;
    avgThroughputPerHour: number;
    failureRate: number;
    avgProcessingTimeMs: number;
    avgDelayMs: number;
  };
  timeSeries: TimeSeriesDataPoint[];
  slowestJobs: SlowJob[];
  failingJobTypes: FailingJobType[];
  queuesCount: number;
  lastUpdated: number;
};
