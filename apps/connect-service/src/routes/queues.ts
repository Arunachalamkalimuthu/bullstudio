import type { IQueueService } from "../interfaces";
import type { Route } from "../lib/router";
import { jsonResponse, errorResponse } from "../lib/response";

export function createQueuesRoutes(queueService: IQueueService): Route[] {
  return [
    {
      method: "GET",
      path: "/api/queues",
      handler: async () => {
        try {
          const queues = await queueService.getQueues();
          return jsonResponse({ queues });
        } catch (error) {
          return errorResponse("Failed to fetch queues", error);
        }
      },
    },
    {
      method: "GET",
      path: "/api/queues/:queueName",
      handler: async (_request, params) => {
        try {
          const queue = await queueService.getQueue(params.queueName!);

          if (!queue) {
            return jsonResponse({ error: "Queue not found" }, 404);
          }

          return jsonResponse({ queue });
        } catch (error) {
          return errorResponse("Failed to fetch queue", error);
        }
      },
    },
    {
      method: "POST",
      path: "/api/queues/:queueName/pause",
      handler: async (_request, params) => {
        try {
          await queueService.pauseQueue(params.queueName!);
          return jsonResponse({
            success: true,
            message: `Queue ${params.queueName} paused`,
          });
        } catch (error) {
          return errorResponse("Failed to pause queue", error);
        }
      },
    },
    {
      method: "POST",
      path: "/api/queues/:queueName/resume",
      handler: async (_request, params) => {
        try {
          await queueService.resumeQueue(params.queueName!);
          return jsonResponse({
            success: true,
            message: `Queue ${params.queueName} resumed`,
          });
        } catch (error) {
          return errorResponse("Failed to resume queue", error);
        }
      },
    },
  ];
}
