import Redis from "ioredis";

export interface RedisConnectionConfig {
  url: string;
  maxRetriesPerRequest?: number | null;
}

export class RedisConnectionManager {
  private static instance: RedisConnectionManager;
  private connections = new Map<string, Redis>();

  private constructor() {}

  static getInstance(): RedisConnectionManager {
    if (!RedisConnectionManager.instance) {
      RedisConnectionManager.instance = new RedisConnectionManager();
    }
    return RedisConnectionManager.instance;
  }

  getConnection(config: RedisConnectionConfig): Redis {
    const key = config.url;

    const existing = this.connections.get(key);
    if (existing && existing.status === "ready") {
      return existing;
    }

    const connection = new Redis(config.url, {
      maxRetriesPerRequest: config.maxRetriesPerRequest ?? null,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    connection.on("error", (err) => {
      console.error(`[Redis] Connection error: ${err.message}`);
    });

    connection.on("connect", () => {
      console.log(`[Redis] Connected to ${config.url}`);
    });

    this.connections.set(key, connection);
    return connection;
  }

  async closeConnection(url: string): Promise<void> {
    const connection = this.connections.get(url);
    if (connection) {
      await connection.quit();
      this.connections.delete(url);
    }
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.entries()).map(
      async ([url, connection]) => {
        await connection.quit();
        this.connections.delete(url);
      }
    );
    await Promise.all(closePromises);
  }
}

export const redisManager = RedisConnectionManager.getInstance();
