import type { PrismaClient, RedisConnection } from "@bullstudio/prisma";
import { RedisConnectionStatus } from "@bullstudio/prisma";
import { EventEmitter } from "events";
import type {
  QueueService,
  QueueServiceEventCallbacks,
  ConnectionConfig,
  ConnectionStatus,
  ConnectionTestResult,
  ConnectionEvent,
  ConnectionEventListener,
  ConnectionState,
} from "../types";
import { ManagedConnection } from "./managed-connection";
import { RetryStrategy } from "./retry-strategy";
import { buildRedisUrl } from "../utils/redis-url-builder";
import { resolveCredentials } from "../utils/credentials-resolver";
import { BullMqProvider } from "../providers/bullmq";
import { ConnectionNotFoundError } from "../errors";

export interface ConnectionManagerConfig {
  prisma: PrismaClient;
  maxReconnectAttempts?: number;
  baseReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
}

export class ConnectionManager {
  private readonly prisma: PrismaClient;
  private readonly connections = new Map<string, ManagedConnection>();
  private readonly workspaceConnectionIds = new Map<string, Set<string>>();
  private readonly loadedWorkspaces = new Set<string>();
  private readonly eventEmitter = new EventEmitter();
  private readonly retryStrategy: RetryStrategy;

  constructor(config: ConnectionManagerConfig) {
    this.prisma = config.prisma;
    this.retryStrategy = new RetryStrategy({
      maxAttempts: config.maxReconnectAttempts ?? 10,
      baseDelayMs: config.baseReconnectDelayMs ?? 1000,
      maxDelayMs: config.maxReconnectDelayMs ?? 60000,
    });
  }

  /**
   * Lazily loads connections for a workspace from the database.
   * Only called once per workspace per server lifetime.
   */
  private async ensureWorkspaceLoaded(workspaceId: string): Promise<void> {
    if (this.loadedWorkspaces.has(workspaceId)) {
      return;
    }

    const connections = await this.prisma.redisConnection.findMany({
      where: { workspaceId },
    });

    for (const dbConnection of connections) {
      if (!this.connections.has(dbConnection.id)) {
        await this.initializeConnection(dbConnection);
      }
    }

    this.loadedWorkspaces.add(workspaceId);
  }

  /**
   * Initialize a connection from database record.
   */
  private async initializeConnection(
    dbConnection: RedisConnection
  ): Promise<ManagedConnection> {
    const config = this.buildConfigFromDb(dbConnection);
    const managed = new ManagedConnection({
      config,
      providerFactory: (eventCallbacks: QueueServiceEventCallbacks) =>
        new BullMqProvider({
          redisUrl: buildRedisUrl(config),
          prefix: config.prefix,
          eventCallbacks,
        }),
      onStateChange: (state) => this.handleStateChange(dbConnection.id, state),
      onError: (error) => this.handleError(dbConnection.id, error),
      retryStrategy: this.retryStrategy,
    });

    this.connections.set(dbConnection.id, managed);

    // Track workspace -> connection mapping
    const workspaceConnections =
      this.workspaceConnectionIds.get(config.workspaceId) ?? new Set();
    workspaceConnections.add(dbConnection.id);
    this.workspaceConnectionIds.set(config.workspaceId, workspaceConnections);

    // Start connection attempt
    await managed.connect();

    return managed;
  }

  /**
   * Build connection config from database record, decrypting credentials.
   */
  private buildConfigFromDb(dbConnection: RedisConnection): ConnectionConfig {
    const { password, tlsCert } = resolveCredentials(dbConnection);

    return {
      id: dbConnection.id,
      workspaceId: dbConnection.workspaceId,
      host: dbConnection.host,
      port: dbConnection.port,
      database: dbConnection.database,
      username: dbConnection.username ?? undefined,
      password,
      tls: dbConnection.tls,
      tlsCert,
    };
  }

  /**
   * Handle connection state changes - update DB accordingly.
   */
  private async handleStateChange(
    connectionId: string,
    state: ConnectionState
  ): Promise<void> {
    console.log(
      `[ConnectionManager] Connection ${connectionId} changed state to ${state}`
    );
    const dbStatus = this.mapStateToDbStatus(state);
    const managed = this.connections.get(connectionId);

    await this.prisma.redisConnection.update({
      where: { id: connectionId },
      data: {
        status: dbStatus,
        lastConnectedAt: state === "connected" ? new Date() : undefined,
        lastHealthCheckAt: new Date(),
        lastError: state === "error" ? managed?.lastError : null,
      },
    });

    this.emit({ type: "state_changed", connectionId, state });

    if (state === "connected") {
      this.emit({ type: "connected", connectionId });
    } else if (state === "disconnected") {
      this.emit({ type: "disconnected", connectionId });
    } else if (state === "reconnecting") {
      this.emit({
        type: "reconnecting",
        connectionId,
        attempt: managed?.toStatus().reconnectAttempts ?? 0,
      });
    }
  }

  private mapStateToDbStatus(state: ConnectionState): RedisConnectionStatus {
    switch (state) {
      case "connected":
        return RedisConnectionStatus.Connected;
      case "connecting":
      case "reconnecting":
        return RedisConnectionStatus.Pending;
      case "disconnected":
        return RedisConnectionStatus.Disconnected;
      case "error":
        return RedisConnectionStatus.Failed;
    }
  }

  /**
   * Handle connection errors.
   */
  private handleError(connectionId: string, error: Error): void {
    this.emit({ type: "error", connectionId, error });
  }

  /**
   * Get or lazily load a connection by ID.
   */
  async getConnection(connectionId: string): Promise<QueueService | null> {
    let managed = this.connections.get(connectionId);

    if (!managed) {
      // Try to load from DB
      const dbConnection = await this.prisma.redisConnection.findUnique({
        where: { id: connectionId },
      });

      if (!dbConnection) {
        return null;
      }

      managed = await this.initializeConnection(dbConnection);
    }

    if (managed.state !== "connected") {
      return null;
    }

    return managed.queueService;
  }

  /**
   * Get all active connections for a workspace.
   */
  async getWorkspaceConnections(
    workspaceId: string
  ): Promise<ConnectionStatus[]> {
    await this.ensureWorkspaceLoaded(workspaceId);

    const connectionIds =
      this.workspaceConnectionIds.get(workspaceId) ?? new Set();
    const statuses: ConnectionStatus[] = [];

    for (const id of connectionIds) {
      const status = this.getStatus(id);
      if (status) {
        statuses.push(status);
      }
    }

    return statuses;
  }

  /**
   * Add a new connection (called after DB insert).
   */
  async addConnection(config: ConnectionConfig): Promise<ConnectionStatus> {
    if (this.connections.has(config.id)) {
      throw new Error(`Connection ${config.id} already exists`);
    }

    const managed = new ManagedConnection({
      config,
      providerFactory: (eventCallbacks: QueueServiceEventCallbacks) =>
        new BullMqProvider({
          redisUrl: buildRedisUrl(config),
          prefix: config.prefix,
          eventCallbacks,
        }),
      onStateChange: (state) => this.handleStateChange(config.id, state),
      onError: (error) => this.handleError(config.id, error),
      retryStrategy: this.retryStrategy,
    });

    this.connections.set(config.id, managed);

    const workspaceConnections =
      this.workspaceConnectionIds.get(config.workspaceId) ?? new Set();
    workspaceConnections.add(config.id);
    this.workspaceConnectionIds.set(config.workspaceId, workspaceConnections);

    await managed.connect();

    return this.getStatus(config.id)!;
  }

  /**
   * Update an existing connection configuration.
   */
  async updateConnection(config: ConnectionConfig): Promise<ConnectionStatus> {
    const existing = this.connections.get(config.id);
    if (existing) {
      await existing.disconnect();
      this.connections.delete(config.id);
    }

    return this.addConnection(config);
  }

  /**
   * Remove a connection (called before/after DB delete).
   */
  async removeConnection(connectionId: string): Promise<void> {
    const managed = this.connections.get(connectionId);
    if (managed) {
      await managed.disconnect();
      this.connections.delete(connectionId);

      // Remove from workspace tracking
      const workspaceConnections = this.workspaceConnectionIds.get(
        managed.config.workspaceId
      );
      workspaceConnections?.delete(connectionId);
    }
  }

  /**
   * Test a connection without persisting it.
   */
  async testConnection(
    config: Omit<ConnectionConfig, "id" | "workspaceId">
  ): Promise<ConnectionTestResult> {
    const provider = new BullMqProvider({
      redisUrl: buildRedisUrl({ ...config, id: "test", workspaceId: "test" }),
      prefix: config.prefix,
    });

    const startTime = Date.now();

    try {
      await provider.connect();
      const latency = Date.now() - startTime;
      await provider.disconnect();
      return { success: true, latency };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  /**
   * Force reconnect a specific connection.
   */
  async reconnect(connectionId: string): Promise<ConnectionStatus> {
    const managed = this.connections.get(connectionId);
    if (!managed) {
      throw new ConnectionNotFoundError(connectionId);
    }

    await managed.reconnect();
    return this.getStatus(connectionId)!;
  }

  /**
   * Get current status of a connection.
   */
  getStatus(connectionId: string): ConnectionStatus | null {
    const managed = this.connections.get(connectionId);
    if (!managed) {
      return null;
    }

    return managed.toStatus();
  }

  /**
   * Subscribe to connection events.
   */
  on(listener: ConnectionEventListener): () => void {
    this.eventEmitter.on("event", listener);
    return () => this.eventEmitter.off("event", listener);
  }

  private emit(event: ConnectionEvent): void {
    this.eventEmitter.emit("event", event);
  }

  /**
   * Gracefully shutdown all connections.
   */
  async shutdown(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.values()).map(
      (managed) => managed.disconnect()
    );

    await Promise.all(disconnectPromises);
    this.connections.clear();
    this.workspaceConnectionIds.clear();
    this.loadedWorkspaces.clear();
  }
}
