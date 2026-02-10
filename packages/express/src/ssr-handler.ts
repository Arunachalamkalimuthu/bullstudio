import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { RequestHandler, Response as ExpressResponse } from "express";
import { toFetchRequest } from "./utils.js";

interface ServerModule {
  fetch: (request: Request) => Promise<Response>;
}

const SKIPPED_HEADERS = new Set(["content-length", "content-encoding"]);

/**
 * Create an SSR handler that delegates to TanStack Start's fetch handler.
 * HTML responses are rewritten to support the base path.
 */
export function createSsrHandler(
  distDir: string,
  basePath: string,
): RequestHandler {
  const serverFile = join(distDir, "server", "server.js");
  let serverModule: ServerModule | null = null;

  async function getServerModule(): Promise<ServerModule> {
    if (!serverModule) {
      const mod = await import(pathToFileURL(serverFile).href);
      serverModule = mod.default || mod;
    }
    return serverModule!;
  }

  return async (req, res, next) => {
    try {
      const server = await getServerModule();
      const fetchRequest = await toFetchRequest(req);
      const response = await server.fetch(fetchRequest);

      copyResponseHeaders(response, res);

      if (!response.body) {
        res.end();
        return;
      }

      const isHtml = (response.headers.get("content-type") ?? "").includes(
        "text/html",
      );

      if (isHtml) {
        await sendRewrittenHtml(response.body, basePath, res);
      } else {
        await streamBody(response.body, res);
      }
    } catch (error) {
      next(error);
    }
  };
}

function copyResponseHeaders(
  response: Response,
  res: ExpressResponse,
): void {
  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (!SKIPPED_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
}

async function sendRewrittenHtml(
  body: ReadableStream<Uint8Array>,
  basePath: string,
  res: ExpressResponse,
): Promise<void> {
  const html = (await readStream(body)).toString("utf-8");
  const rewritten = rewriteHtml(html, basePath);
  res.setHeader("Content-Length", Buffer.byteLength(rewritten));
  res.end(rewritten);
}

async function streamBody(
  body: ReadableStream<Uint8Array>,
  res: ExpressResponse,
): Promise<void> {
  const reader = body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

async function readStream(
  body: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

/**
 * Rewrite HTML to support mounting at a sub-path:
 * 1. Inject a script that sets window.__BULLSTUDIO_BASE_PATH__
 * 2. Rewrite src="/..." and href="/..." to include the base path
 */
function rewriteHtml(html: string, basePath: string): string {
  if (!basePath || basePath === "/") return html;

  const basePathScript = `<script>window.__BULLSTUDIO_BASE_PATH__="${basePath}"</script>`;

  return html
    .replace("<head>", `<head>${basePathScript}`)
    .replace(/(\s(?:src|href))="\/(?!\/)/g, `$1="${basePath}/`);
}
