import { TRPCError } from "@trpc/server";
import { getConnectionManager } from "@bullstudio/queue";
import { AuthedTRPCContext } from "../../types";
import type {
  ListQueuesInput,
  GetQueueInput,
  PauseQueueInput,
  ResumeQueueInput,
} from "./queue.schema";

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

type ListQueuesHandlerProps = {
  ctx: AuthedTRPCContext;
  input: ListQueuesInput;
};

export async function listQueuesHandler({ ctx, input }: ListQueuesHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);
  return service.getQueues();
}

type GetQueueHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetQueueInput;
};

export async function getQueueHandler({ ctx, input }: GetQueueHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);
  const queue = await service.getQueue(input.queueName);

  if (!queue) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Queue not found" });
  }

  return queue;
}

type PauseQueueHandlerProps = {
  ctx: AuthedTRPCContext;
  input: PauseQueueInput;
};

export async function pauseQueueHandler({ ctx, input }: PauseQueueHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);
  await service.pauseQueue(input.queueName);
  return { success: true };
}

type ResumeQueueHandlerProps = {
  ctx: AuthedTRPCContext;
  input: ResumeQueueInput;
};

export async function resumeQueueHandler({ ctx, input }: ResumeQueueHandlerProps) {
  const service = await getQueueService(ctx, input.connectionId);
  await service.resumeQueue(input.queueName);
  return { success: true };
}
