// Types
export type {
  ConnectionConfig,
  ConnectionStatus,
  ConnectionTestResult,
  ConnectionState,
  ConnectionEvent,
  ConnectionEventListener,
} from "./types";

export type {
  QueueService,
  QueueServiceConfig,
  QueueProviderType,
} from "./types";

// Classes
export {
  ConnectionManager,
  type ConnectionManagerConfig,
} from "./connection-manager";
export { BullMqProvider } from "./providers";

// Errors
export * from "./errors";

// Singleton instance factory
import type { PrismaClient } from "@bullstudio/prisma";
import { ConnectionManager } from "./connection-manager";

let instance: ConnectionManager | null = null;

export function getConnectionManager(prisma: PrismaClient): ConnectionManager {
  if (!instance) {
    instance = new ConnectionManager({ prisma });
  }
  return instance;
}

export function resetConnectionManager(): void {
  if (instance) {
    instance.shutdown();
    instance = null;
  }
}
