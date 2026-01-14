import type { IJob, IJobQueryOptions } from "./job.interface";
import type { IQueue } from "./queue.interface";
import type { IWorkerCount } from "./worker.interface";

export interface IQueueServiceConfig {
  redisUrl: string;
  prefix?: string;
}

export interface IQueueService {
  connect(): Promise<void>;

  disconnect(): Promise<void>;

  getQueues(): Promise<IQueue[]>;

  getQueue(name: string): Promise<IQueue | null>;

  getJobs(queueName: string, options?: IJobQueryOptions): Promise<IJob[]>;

  getJob(queueName: string, jobId: string): Promise<IJob | null>;

  getWorkerCount(queueName: string): Promise<IWorkerCount>;

  retryJob(queueName: string, jobId: string): Promise<void>;

  removeJob(queueName: string, jobId: string): Promise<void>;

  pauseQueue(queueName: string): Promise<void>;

  resumeQueue(queueName: string): Promise<void>;
}
