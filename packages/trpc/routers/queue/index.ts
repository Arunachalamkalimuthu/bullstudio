import { authedProcedure, router } from "../../init";
import {
  listQueuesSchema,
  getQueueSchema,
  pauseQueueSchema,
  resumeQueueSchema,
} from "./queue.schema";
import {
  listQueuesHandler,
  getQueueHandler,
  pauseQueueHandler,
  resumeQueueHandler,
} from "./queue.handler";
import {
  listJobsSchema,
  getJobSchema,
  retryJobSchema,
  removeJobSchema,
} from "./job.schema";
import {
  listJobsHandler,
  getJobHandler,
  retryJobHandler,
  removeJobHandler,
} from "./job.handler";
import { overviewMetricsSchema } from "./overview-metrics.schema";
import { overviewMetricsHandler } from "./overview-metrics.handler";

export const queueRouter = router({
  // Queue operations
  list: authedProcedure
    .input(listQueuesSchema)
    .query(({ ctx, input }) => listQueuesHandler({ ctx, input })),

  get: authedProcedure
    .input(getQueueSchema)
    .query(({ ctx, input }) => getQueueHandler({ ctx, input })),

  pause: authedProcedure
    .input(pauseQueueSchema)
    .mutation(({ ctx, input }) => pauseQueueHandler({ ctx, input })),

  resume: authedProcedure
    .input(resumeQueueSchema)
    .mutation(({ ctx, input }) => resumeQueueHandler({ ctx, input })),

  // Job operations
  jobs: authedProcedure
    .input(listJobsSchema)
    .query(({ ctx, input }) => listJobsHandler({ ctx, input })),

  job: authedProcedure
    .input(getJobSchema)
    .query(({ ctx, input }) => getJobHandler({ ctx, input })),

  retryJob: authedProcedure
    .input(retryJobSchema)
    .mutation(({ ctx, input }) => retryJobHandler({ ctx, input })),

  removeJob: authedProcedure
    .input(removeJobSchema)
    .mutation(({ ctx, input }) => removeJobHandler({ ctx, input })),

  // Overview metrics
  overviewMetrics: authedProcedure
    .input(overviewMetricsSchema)
    .query(({ ctx, input }) => overviewMetricsHandler({ ctx, input })),
});
