import { TRPCError } from "@trpc/server";
import { RedisConnectionStatus } from "@bullstudio/prisma";
import { getConnectionManager } from "@bullstudio/queue";
import { AuthedTRPCContext } from "../../types";
import { workspaceGuard } from "../../guards/workspace";
import { connectionLimitGuard } from "../../guards/billing";
import { encrypt } from "../../services/encryption";
import { CreateRedisConnectionInput } from "./create.schema";

type CreateRedisConnectionHandlerProps = {
  ctx: AuthedTRPCContext;
  input: CreateRedisConnectionInput;
};

export async function createRedisConnectionHandler({
  ctx,
  input,
}: CreateRedisConnectionHandlerProps) {
  const { prisma } = ctx;

  await workspaceGuard({ ctx, workspaceId: input.workspaceId });

  // Check billing limits
  await connectionLimitGuard(input.workspaceId);

  const existingConnection = await prisma.redisConnection.findFirst({
    where: {
      workspaceId: input.workspaceId,
      name: input.name,
    },
  });

  if (existingConnection) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A connection with this name already exists in this workspace",
    });
  }

  const passwordData = input.password ? encrypt(input.password) : null;
  const tlsCertData = input.tlsCert ? encrypt(input.tlsCert) : null;

  const connection = await prisma.redisConnection.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      host: input.host,
      port: input.port,
      database: input.database,
      username: input.username || null,
      tls: input.tls,
      encryptedPassword: passwordData?.encrypted ?? null,
      passwordIv: passwordData?.iv ?? null,
      passwordTag: passwordData?.tag ?? null,
      encryptedTlsCert: tlsCertData?.encrypted ?? null,
      tlsCertIv: tlsCertData?.iv ?? null,
      tlsCertTag: tlsCertData?.tag ?? null,
      status: RedisConnectionStatus.Pending,
    },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      database: true,
      tls: true,
      username: true,
      accessMode: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Register with connection manager
  try {
    const connectionManager = getConnectionManager(prisma);
    const status = await connectionManager.addConnection({
      id: connection.id,
      workspaceId: input.workspaceId,
      host: input.host,
      port: input.port,
      database: input.database,
      username: input.username,
      password: input.password,
      tls: input.tls,
      tlsCert: input.tlsCert,
    });

    // Status is already updated by the connection manager via handleStateChange
    // but we return the current status to the client
    const newStatus =
      status.state === "connected"
        ? RedisConnectionStatus.Connected
        : status.state === "error"
          ? RedisConnectionStatus.Failed
          : RedisConnectionStatus.Pending;

    return { ...connection, status: newStatus };
  } catch (error) {
    // Log but don't fail - connection is saved in DB
    console.error("[createRedisConnection] Failed to establish connection:", error);
    return connection;
  }
}
