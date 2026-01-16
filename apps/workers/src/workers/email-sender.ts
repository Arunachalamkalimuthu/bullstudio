import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { EMAIL_QUEUE_NAME, type EmailJobData } from "../queues/email";
import {
  AlertResolvedEmail,
  type AlertTriggeredEmailProps,
  AlertTriggeredEmail,
  defaultClient,
  AlertResolvedEmailProps,
} from "@bullstudio/email";

const sendAlertTriggeredEmail = async (data: EmailJobData) => {
  const props: AlertTriggeredEmailProps = {
    alertName: data.alertName,
    alertType: data.alertType,
    queueName: data.queueName,
    connectionName: data.connectionName,
    currentValue: data.value.toString(),
    threshold: data.threshold.toString(),
    message: data.message,
    timestamp: new Date(data.triggerTimestamp),
    dashboardUrl: process.env.APP_URL || "http://localhost:3000",
  };
  return defaultClient.send({
    to: data.recipients,
    subject: `🚨 Alert Triggered: ${data.alertName}`,
    template: AlertTriggeredEmail,
    props,
  });
};

const sendAlertResolvedEmail = async (data: EmailJobData) => {
  const props: AlertResolvedEmailProps = {
    alertName: data.alertName,
    alertType: data.alertType,
    queueName: data.queueName,
    connectionName: data.connectionName,
    currentValue: data.value.toString(),
    previousValue: (data.lastValue || -1).toString(),
    resolvedAt: new Date(data.resolvedTimestamp || Date.now()),
    triggeredAt: new Date(data.triggerTimestamp), // assuming resolved 1 min after triggered
    dashboardUrl: process.env.APP_URL || "http://localhost:3000",
  };
  return defaultClient.send({
    to: data.recipients,
    subject: `✅ Alert Resolved: ${data.alertName}`,
    template: AlertResolvedEmail,
    props,
  });
};

export function createEmailSenderWorker() {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const data = job.data;
      console.log(
        `[EmailSender] Processing ${data.type} email for alert ${data.alertId}`
      );

      const isTriggered = data.type === "alert-triggered";

      let result: Awaited<ReturnType<typeof sendAlertTriggeredEmail>>;
      if (isTriggered) {
        result = await sendAlertTriggeredEmail(data);
        console.log(`[EmailSender] Email sent successfully: ${result.success}`);
        return { sent: true };
      }

      result = await sendAlertResolvedEmail(data);
      console.log(`[EmailSender] Email sent successfully: ${result.success}`);

      return result;
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on("completed", (job: Job<EmailJobData>) => {
    console.log(`[EmailSender] Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job<EmailJobData> | undefined, error: Error) => {
    console.error(`[EmailSender] Job ${job?.id} failed:`, error);
  });

  return worker;
}
