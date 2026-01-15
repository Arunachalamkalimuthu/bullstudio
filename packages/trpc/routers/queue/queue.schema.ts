import { z } from "zod";

export const listQueuesSchema = z.object({
  connectionId: z.string(),
});

export type ListQueuesInput = z.infer<typeof listQueuesSchema>;

export const getQueueSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
});

export type GetQueueInput = z.infer<typeof getQueueSchema>;

export const pauseQueueSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
});

export type PauseQueueInput = z.infer<typeof pauseQueueSchema>;

export const resumeQueueSchema = z.object({
  connectionId: z.string(),
  queueName: z.string(),
});

export type ResumeQueueInput = z.infer<typeof resumeQueueSchema>;
