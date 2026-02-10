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
  const distDir = resolveBullStudioDist();
  const router = Router();

  router.use(createStaticHandler(distDir));
  router.use(createLazySsrHandler(distDir, options));

  return router;
}

function setEnvironment(options: BullStudioOptions): void {
  warnIfOverwriting("REDIS_URL", options.redisUrl);
  process.env.REDIS_URL = options.redisUrl;

  if (options.auth) {
    process.env.BULLSTUDIO_USERNAME = options.auth.username;
    process.env.BULLSTUDIO_PASSWORD = options.auth.password;
  }
}

function warnIfOverwriting(key: string, newValue: string): void {
  const current = process.env[key];
  if (current && current !== newValue) {
    console.warn(
      `[bullstudio] Overwriting process.env.${key}. Multiple createBullStudio() calls with different values are not supported.`,
    );
  }
}

/**
 * Wraps the SSR handler so it's created once after the base path
 * is resolved from the first incoming request.
 * Environment variables are also deferred to avoid eager Redis connections.
 */
function createLazySsrHandler(
  distDir: string,
  options: BullStudioOptions,
): RequestHandler {
  let handler: RequestHandler | null = null;

  return (req, res, next) => {
    if (!handler) {
      setEnvironment(options);
      handler = createSsrHandler(distDir, normalizeBasePath(req.baseUrl));
    }
    handler(req, res, next);
  };
}

function normalizeBasePath(baseUrl: string): string {
  const basePath = baseUrl || "";
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}
