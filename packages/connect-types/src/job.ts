export type JobStatus =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed"
  | "paused"
  | "waiting-children";

export interface Job {
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
  parentId?: string;
  repeatJobKey?: string;
}

export interface JobFilter {
  status?: JobStatus | JobStatus[];
  name?: string;
  start?: number;
  end?: number;
}

export interface JobSort {
  field: "timestamp" | "processedOn" | "finishedOn" | "progress";
  order: "asc" | "desc";
}

export interface JobQueryOptions {
  filter?: JobFilter;
  sort?: JobSort;
  limit?: number;
  offset?: number;
}
