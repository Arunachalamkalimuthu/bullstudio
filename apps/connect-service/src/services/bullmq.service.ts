import { Queue, Job as BullJob } from "bullmq";
import type Redis from "ioredis";
import type {
  IQueueService,
  IQueueServiceConfig,
  IQueue,
  IJob,
  JobStatus,
  IJobQueryOptions,
  IWorkerCount,
  IJobCounts,
} from "../interfaces";
import { redisManager } from "../lib/redis";

const BULL_PREFIX = "bull";

export class BullMqService implements IQueueService {
  private config: IQueueServiceConfig;
  private connection: Redis | null = null;
  private queues = new Map<string, Queue>();

  constructor(config: IQueueServiceConfig) {
    this.config = {
      prefix: BULL_PREFIX,
      ...config,
    };
  }

  async connect(): Promise<void> {
    this.connection = redisManager.getConnection({
      url: this.config.redisUrl,
      maxRetriesPerRequest: null,
    });
  }

  async disconnect(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) =>
      queue.close()
    );
    await Promise.all(closePromises);
    this.queues.clear();

    if (this.connection) {
      await redisManager.closeConnection(this.config.redisUrl);
      this.connection = null;
    }
  }

  async getQueues(): Promise<IQueue[]> {
    const queueNames = await this.discoverQueues();
    const queues = await Promise.all(
      queueNames.map((name) => this.getQueue(name))
    );
    return queues.filter((q): q is IQueue => q !== null);
  }

  async getQueue(name: string): Promise<IQueue | null> {
    const queue = this.getOrCreateQueue(name);
    const [isPaused, jobCounts] = await Promise.all([
      queue.isPaused(),
      this.getJobCounts(queue),
    ]);

    return {
      name,
      isPaused,
      jobCounts,
    };
  }

  async getJobs(queueName: string, options?: IJobQueryOptions): Promise<IJob[]> {
    const queue = this.getOrCreateQueue(queueName);
    const { filter, sort, limit = 100, offset = 0 } = options ?? {};

    const statuses = this.resolveStatuses(filter?.status);
    const jobs = await queue.getJobs(statuses, offset, offset + limit - 1);

    let mappedJobs = jobs
      .filter((job): job is BullJob => job !== undefined)
      .map((job) => this.mapJob(job, queueName));

    if (filter?.name) {
      mappedJobs = mappedJobs.filter((job) => job.name === filter.name);
    }

    if (sort) {
      mappedJobs = this.sortJobs(mappedJobs, sort.field, sort.order);
    }

    return mappedJobs;
  }

  async getJob(queueName: string, jobId: string): Promise<IJob | null> {
    const queue = this.getOrCreateQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    return this.mapJob(job, queueName);
  }

  async getWorkerCount(queueName: string): Promise<IWorkerCount> {
    const queue = this.getOrCreateQueue(queueName);
    const workers = await queue.getWorkers();

    return {
      queueName,
      count: workers.length,
    };
  }

  async retryJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.retry();
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.remove();
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.pause();
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.resume();
  }

  private getOrCreateQueue(name: string): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, {
        connection: this.connection!,
        prefix: this.config.prefix,
      });
      this.queues.set(name, queue);
    }
    return queue;
  }

  private async discoverQueues(): Promise<string[]> {
    if (!this.connection) {
      throw new Error("Not connected to Redis");
    }

    const prefix = this.config.prefix ?? BULL_PREFIX;
    const pattern = `${prefix}:*:meta`;
    const keys = await this.connection.keys(pattern);

    const queueNames = keys.map((key) => {
      const parts = key.split(":");
      return parts[1] ?? "";
    }).filter(Boolean);

    return [...new Set(queueNames)];
  }

  private async getJobCounts(queue: Queue): Promise<IJobCounts> {
    const counts = await queue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
      "paused",
      "prioritized",
      "waiting-children"
    );

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      paused: counts.paused ?? 0,
      prioritized: counts.prioritized ?? 0,
      waitingChildren: counts["waiting-children"] ?? 0,
    };
  }

  private resolveStatuses(
    status?: JobStatus | JobStatus[]
  ): (
    | "waiting"
    | "active"
    | "completed"
    | "failed"
    | "delayed"
    | "paused"
    | "prioritized"
    | "waiting-children"
  )[] {
    if (!status) {
      return [
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
        "paused",
        "prioritized",
        "waiting-children",
      ];
    }

    const statuses = Array.isArray(status) ? status : [status];
    return statuses as (
      | "waiting"
      | "active"
      | "completed"
      | "failed"
      | "delayed"
      | "paused"
      | "prioritized"
      | "waiting-children"
    )[];
  }

  private mapJob(job: BullJob, queueName: string): IJob {
    return {
      id: job.id ?? "",
      name: job.name,
      queueName,
      data: job.data,
      status: this.mapJobState(job),
      progress: this.normalizeProgress(job.progress),
      attemptsMade: job.attemptsMade,
      attemptsLimit: job.opts?.attempts ?? 1,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      returnValue: job.returnvalue,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      delay: job.opts?.delay,
      priority: job.opts?.priority,
      parentId: job.parentKey?.split(":").pop(),
      repeatJobKey: job.repeatJobKey,
    };
  }

  private mapJobState(job: BullJob): JobStatus {
    if (job.finishedOn && job.failedReason) {
      return "failed";
    }
    if (job.finishedOn) {
      return "completed";
    }
    if (job.processedOn) {
      return "active";
    }
    if (job.opts?.delay && job.timestamp + job.opts.delay > Date.now()) {
      return "delayed";
    }
    return "waiting";
  }

  private normalizeProgress(
    progress: number | string | object | boolean
  ): number | object {
    if (typeof progress === "boolean") {
      return progress ? 100 : 0;
    }
    if (typeof progress === "string") {
      const parsed = parseFloat(progress);
      return isNaN(parsed) ? { value: progress } : parsed;
    }
    return progress;
  }

  private sortJobs(
    jobs: IJob[],
    field: "timestamp" | "processedOn" | "finishedOn" | "progress",
    order: "asc" | "desc"
  ): IJob[] {
    return [...jobs].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (field === "progress") {
        aValue = typeof a.progress === "number" ? a.progress : 0;
        bValue = typeof b.progress === "number" ? b.progress : 0;
      } else {
        aValue = a[field] ?? 0;
        bValue = b[field] ?? 0;
      }

      return order === "asc" ? aValue - bValue : bValue - aValue;
    });
  }
}
