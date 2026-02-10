import { Router } from "express";
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
 * import { createBullStudio } from '@bullstudio/express'
 *
 * const app = express()
 * app.use('/admin/queues', createBullStudio({ redisUrl: 'redis://localhost:6379' }))
 * app.listen(3000)
 * ```
 */
export function createBullStudio(options: BullStudioOptions): Router {
  // Set Redis URL for the SSR handler's connection.ts to pick up
  process.env.REDIS_URL = options.redisUrl;

  // Set auth credentials if provided
  if (options.auth) {
    process.env.BULLSTUDIO_USERNAME = options.auth.username;
    process.env.BULLSTUDIO_PASSWORD = options.auth.password;
  }

  const distDir = resolveBullStudioDist();
  const router = Router();

  // Determine the base path at request time from the mount path
  let resolvedBasePath: string | undefined;

  router.use((req, _res, next) => {
    if (resolvedBasePath === undefined) {
      // req.baseUrl is the mount path (e.g. "/admin/queues")
      resolvedBasePath = req.baseUrl || "";
      // Remove trailing slash
      if (resolvedBasePath.endsWith("/")) {
        resolvedBasePath = resolvedBasePath.slice(0, -1);
      }
    }
    next();
  });

  // Serve static assets from dist/client
  router.use(createStaticHandler(distDir));

  // All other routes go through SSR
  // We use a lazy wrapper so the basePath is resolved on first request
  router.use((req, res, next) => {
    const handler = createSsrHandler(distDir, resolvedBasePath ?? "");
    handler(req, res, next);
  });

  return router;
}
