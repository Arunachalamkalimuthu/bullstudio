import { TRPCError } from "@trpc/server";
import { getConnectionManager } from "@bullstudio/queue";
import { AuthedTRPCContext } from "../../types";
import type {
  ListJobsInput,
  GetJobInput,
  RetryJobInput,
  RemoveJobInput,
} from "./job.schema";

async function getQueueService(ctx: AuthedTRPCContext, connectionId: string) {
  const { prisma, user } = ctx;

  const connection = await prisma.redisConnection.findUnique({
    where: { id: connectionId },
    include: {
      workspace: {
        include: {
          members: { where: { userId: user.id } },
        },
      },
    },
  });

  if (!connection) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
  }

  if (connection.workspace.members.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this connection",
    });
  }

  const connectionManager = getConnectionManager(prisma);
  const service = await connectionManager.getConnection(connectionId);

  if (!service) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Connection is not available",
    });
  }

  return service;
}

type ListJobsHandlerProps = {
  ctx: AuthedTRPCContext;
  input: ListJobsInput;
};

export async function listJobsHandler({ ctx, input }: ListJobsHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);
  return service.getJobs(input.queueName, {
    filter: input.filter,
    sort: input.sort,
    limit: input.limit,
    offset: input.offset,
  });
}

type GetJobHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetJobInput;
};

export async function getJobHandler({ ctx, input }: GetJobHandlerProps) {
  //console.log("Getting job", input);
  const service = await getQueueService(ctx, input.connectionId);
  const job = await service.getJob(input.queueName, input.jobId);

  if (!job) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
  }

  return job;
}

type RetryJobHandlerProps = {
  ctx: AuthedTRPCContext;
  input: RetryJobInput;
};

export async function retryJobHandler({ ctx, input }: RetryJobHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);

  try {
    await service.retryJob(input.queueName, input.jobId);
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error instanceof Error ? error.message : "Failed to retry job",
    });
  }
}

type RemoveJobHandlerProps = {
  ctx: AuthedTRPCContext;
  input: RemoveJobInput;
};

export async function removeJobHandler({ ctx, input }: RemoveJobHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);

  try {
    await service.removeJob(input.queueName, input.jobId);
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error instanceof Error ? error.message : "Failed to remove job",
    });
  }
}
