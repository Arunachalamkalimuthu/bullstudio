import type { Job } from "./job";
import type { Queue } from "./queue";
import type { WorkerCount } from "./worker";

export interface ApiSuccessResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: string;
}

export interface HealthResponse {
  status: "ok";
  timestamp: number;
}

export interface QueuesResponse {
  queues: Queue[];
}

export interface QueueResponse {
  queue: Queue;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
}

export interface JobResponse {
  job: Job;
}

export type WorkerCountResponse = WorkerCount;
