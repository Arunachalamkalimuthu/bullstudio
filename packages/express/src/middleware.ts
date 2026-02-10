import { Router, type RequestHandler } from "express";
import type { BullStudioOptions } from "./types.js";
import { resolveBullStudioDist } from "./utils.js";
import { createStaticHandler } from "./static-handler.js";
import { createSsrHandler } from "./ssr-handler.js";

/**
 * Create an Express middleware that serves the bullstudio dashboard.
 *
 * @example
 * ```ts
 * import express from 'express'
 * import { createBullStudio } from 'bullstudio-express'
 *
 * const app = express()
 * app.use('/admin/queues', createBullStudio({ redisUrl: 'redis://localhost:6379' }))
 * app.listen(3000)
 * ```
 */
export function createBullStudio(options: BullStudioOptions): Router {
  setEnvironment(options);

  const distDir = resolveBullStudioDist();
  const router = Router();

  router.use(createStaticHandler(distDir));
  router.use(createLazySsrHandler(distDir));

  return router;
}

function setEnvironment(options: BullStudioOptions): void {
  process.env.REDIS_URL = options.redisUrl;

  if (options.auth) {
    process.env.BULLSTUDIO_USERNAME = options.auth.username;
    process.env.BULLSTUDIO_PASSWORD = options.auth.password;
  }
}

/**
 * Wraps the SSR handler so it's created once after the base path
 * is resolved from the first incoming request.
 */
function createLazySsrHandler(distDir: string): RequestHandler {
  let handler: RequestHandler | undefined;

  return (req, res, next) => {
    if (!handler) {
      const basePath = normalizeBasePath(req.baseUrl);
      handler = createSsrHandler(distDir, basePath);
    }
    handler(req, res, next);
  };
}

function normalizeBasePath(baseUrl: string): string {
  const basePath = baseUrl || "";
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}
