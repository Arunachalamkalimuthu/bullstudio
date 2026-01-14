import { BullMqService } from "./services";
import { createAuthMiddleware } from "./middleware";
import { Router, jsonResponse } from "./lib";
import {
  createHealthRoutes,
  createQueuesRoutes,
  createJobsRoutes,
  createWorkersRoutes,
} from "./routes";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const API_KEY = process.env.CONNECT_SERVICE_API_KEY;

if (!API_KEY) {
  console.error(
    "[Error] CONNECT_SERVICE_API_KEY environment variable is required"
  );
  process.exit(1);
}

const queueService = new BullMqService({ redisUrl: REDIS_URL });
const authenticate = createAuthMiddleware({ apiKey: API_KEY });

const router = new Router();
router.register(createHealthRoutes());
router.register(createQueuesRoutes(queueService));
router.register(createJobsRoutes(queueService));
router.register(createWorkersRoutes(queueService));

await queueService.connect();
console.log(`[Connect Service] Connected to Redis at ${REDIS_URL}`);

const server = Bun.serve({
  port: PORT,
  fetch: async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (url.pathname !== "/health") {
      const authError = authenticate(request);
      if (authError) {
        return authError;
      }
    }

    const response = await router.handle(request);
    if (response) {
      return response;
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
});

console.log(`[Connect Service] Server running on port ${PORT}`);

process.on("SIGINT", async () => {
  console.log("\n[Connect Service] Shutting down...");
  await queueService.disconnect();
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[Connect Service] Shutting down...");
  await queueService.disconnect();
  server.stop();
  process.exit(0);
});
