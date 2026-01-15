import { TRPCError } from "@trpc/server";
import { getConnectionManager } from "@bullstudio/queue";
import { AuthedTRPCContext } from "../../types";
import { DeleteRedisConnectionInput } from "./delete.schema";

type DeleteRedisConnectionHandlerProps = {
  ctx: AuthedTRPCContext;
  input: DeleteRedisConnectionInput;
};

export async function deleteRedisConnectionHandler({
  ctx,
  input,
}: DeleteRedisConnectionHandlerProps) {
  const { prisma, user } = ctx;

  const connection = await prisma.redisConnection.findUnique({
    where: { id: input.connectionId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!connection) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Connection not found",
    });
  }

  if (connection.workspace.members.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this connection",
    });
  }

  // Remove from connection manager first
  try {
    const connectionManager = getConnectionManager(prisma);
    await connectionManager.removeConnection(input.connectionId);
  } catch (error) {
    console.error("[deleteRedisConnection] Failed to remove from connection manager:", error);
    // Continue with deletion from DB even if connection manager fails
  }

  await prisma.redisConnection.delete({
    where: { id: input.connectionId },
  });

  return { success: true };
}
