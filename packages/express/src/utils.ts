import { createRequire } from "node:module";
import { join } from "node:path";
import type { Request as ExpressRequest } from "express";

/**
 * Resolve the dist directory of the installed `bullstudio` package.
 * Uses createRequire so it works regardless of the consumer's module system.
 */
export function resolveBullStudioDist(): string {
  try {
    const require = createRequire(__filename);
    const bullstudioPkg = require.resolve("bullstudio/package.json");
    return join(bullstudioPkg, "..", "dist");
  } catch {
    throw new Error(
      'Could not resolve "bullstudio" package. Make sure it is installed as a dependency.',
    );
  }
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
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req);
  }

  return new Request(url, { method: req.method, headers, body });
}

function readBody(req: ExpressRequest): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      resolve(
        buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      );
    });
  });
}
