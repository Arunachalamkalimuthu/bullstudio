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
  if (!options?.redisUrl) {
    throw new Error(
      "[bullstudio] `redisUrl` is required. Received: " +
        JSON.stringify(options?.redisUrl) +
        ". Make sure the value is defined when calling createBullStudio().",
    );
  }

  const distDir = resolveBullStudioDist();
  const router = Router();

  if (options.auth) {
    router.use(createBasicAuthHandler(options.auth));
  }

  router.use(createStaticHandler(distDir));
  router.use(createLazySsrHandler(distDir, options));

  return router;
}

function setEnvironment(options: BullStudioOptions, basePath: string): void {
  setEnvVar("REDIS_URL", options.redisUrl);
  // Always set base path, even if empty (mounted at root)
  process.env.BULLSTUDIO_BASE_PATH = basePath;

  if (options.auth) {
    setEnvVar("BULLSTUDIO_USERNAME", options.auth.username);
    setEnvVar("BULLSTUDIO_PASSWORD", options.auth.password);
  }
}

function setEnvVar(key: string, value: string | undefined): void {
  if (!value) return;
  warnIfOverwriting(key, value);
  process.env[key] = value;
}

function warnIfOverwriting(key: string, newValue: string): void {
  const current = process.env[key];
  if (current && current !== newValue) {
    console.warn(
      `[bullstudio] Overwriting process.env.${key}. Multiple createBullStudio() calls with different values are not supported.`,
    );
  }
}

function createBasicAuthHandler(
  auth: NonNullable<BullStudioOptions["auth"]>,
): RequestHandler {
  const expected =
    "Basic " + Buffer.from(`${auth.username}:${auth.password}`).toString("base64");

  return (req, res, next) => {
    const header = req.headers.authorization;
    if (header === expected) return next();

    res.setHeader("WWW-Authenticate", 'Basic realm="bullstudio"');
    res.status(401).end("Authentication required");
  };
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
      const basePath = normalizeBasePath(req.baseUrl);
      setEnvironment(options, basePath);
      handler = createSsrHandler(distDir, basePath);
    }
    handler(req, res, next);
  };
}

function normalizeBasePath(baseUrl: string): string {
  const basePath = baseUrl || "";
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}
