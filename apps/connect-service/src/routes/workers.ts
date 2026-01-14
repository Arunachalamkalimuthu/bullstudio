import type { IQueueService } from "../interfaces";
import type { Route } from "../lib/router";
import { jsonResponse, errorResponse } from "../lib/response";

export function createWorkersRoutes(queueService: IQueueService): Route[] {
  return [
    {
      method: "GET",
      path: "/api/queues/:queueName/workers/count",
      handler: async (_request, params) => {
        try {
          const workerCount = await queueService.getWorkerCount(
            params.queueName!
          );
          return jsonResponse(workerCount);
        } catch (error) {
          return errorResponse("Failed to fetch worker count", error);
        }
      },
    },
  ];
}
