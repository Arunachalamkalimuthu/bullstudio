import { createRequire } from "node:module";
import { join } from "node:path";
import type { Request as ExpressRequest } from "express";

/**
 * Resolve the dist directory of the installed `bullstudio` package.
 * Uses createRequire so it works regardless of the consumer's module system.
 */
export function resolveBullStudioDist(): string {
  const require = createRequire(import.meta.url);
  const bullstudioPkg = require.resolve("bullstudio/package.json");
  return join(bullstudioPkg, "..", "dist");
}

/**
 * Convert an Express request into a Fetch API Request object.
 * Express strips the mount path from req.url, so the SSR handler
 * sees paths relative to the mount point (e.g. "/jobs" not "/admin/queues/jobs").
 */
export async function toFetchRequest(
  req: ExpressRequest,
): Promise<Request> {
  const protocol = req.protocol;
  const host = req.get("host") ?? "localhost";
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else {
        headers.set(key, value);
      }
    }
  }

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
    body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }

  return new Request(url, {
    method: req.method,
    headers,
    body,
  });
}
