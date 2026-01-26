import { Queue } from "bullmq";
import { redis } from "../lib/redis";
import type { AlertType, AlertStatus } from "@bullstudio/prisma";

export const EMAIL_QUEUE_NAME = "email";

export type EmailJobData = {
  type: "alert-triggered" | "alert-resolved";
  recipients: string[];
  alertId: string;
  alertName: string;
  alertType: AlertType;
  queueName: string;
  connectionName: string;
  status: AlertStatus;
  threshold: number;
  message: string;
  triggerTimestamp: number;
  value: number;
  lastValue?: number;
  resolvedTimestamp?: number;
};

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 1000, age: 604800 }, // 1 week
    removeOnFail: { count: 500, age: 604800 }, // 1 week
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
