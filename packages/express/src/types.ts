export interface BullStudioOptions {
  /** Redis connection URL (e.g. "redis://localhost:6379") */
  redisUrl: string;

  /** Optional Basic Auth credentials for the dashboard */
  auth?: {
    username: string;
    password: string;
  };
}
