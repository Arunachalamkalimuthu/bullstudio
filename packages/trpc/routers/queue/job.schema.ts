import { z } from "zod";

const jobStatusSchema = z.enum([
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed",
  "paused",
  "waiting-children",
]);

export const listJobsSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
  filter: z
    .object({
      status: z.union([jobStatusSchema, z.array(jobStatusSchema)]).optional(),
      name: z.string().optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.enum(["timestamp", "processedOn", "finishedOn", "progress"]),
      order: z.enum(["asc", "desc"]),
    })
    .optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
  offset: z.number().min(0).optional().default(0),
});

export type ListJobsInput = z.infer<typeof listJobsSchema>;

export const getJobSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
  jobId: z.string(),
});

export type GetJobInput = z.infer<typeof getJobSchema>;

export const retryJobSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
  jobId: z.string(),
});

export type RetryJobInput = z.infer<typeof retryJobSchema>;

export const removeJobSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
  jobId: z.string(),
});

export type RemoveJobInput = z.infer<typeof removeJobSchema>;
