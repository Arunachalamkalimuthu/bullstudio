import { join } from "node:path";
import express, { type RequestHandler } from "express";

/**
 * Create a static file handler that serves the built client assets
 * from the bullstudio dist/client directory.
 */
export function createStaticHandler(distDir: string): RequestHandler {
  const clientDir = join(distDir, "client");

  return express.static(clientDir, {
    maxAge: "1h",
    immutable: false,
    setHeaders(res, filePath) {
      // Hashed assets get long-lived cache
      if (filePath.includes("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  });
}
