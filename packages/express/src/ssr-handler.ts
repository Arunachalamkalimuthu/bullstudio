import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { RequestHandler } from "express";
import { toFetchRequest } from "./utils.js";

interface ServerModule {
  fetch: (request: Request) => Promise<Response>;
}

/**
 * Rewrite HTML to support mounting at a sub-path:
 * 1. Inject a script that sets window.__BULLSTUDIO_BASE_PATH__
 * 2. Rewrite src="/assets/..." to src="/basePath/assets/..."
 * 3. Rewrite href="/assets/..." to href="/basePath/assets/..."
 * 4. Rewrite href="/logo.svg" to href="/basePath/logo.svg"
 */
function rewriteHtml(html: string, basePath: string): string {
  if (!basePath || basePath === "/") return html;

  const basePathScript = `<script>window.__BULLSTUDIO_BASE_PATH__="${basePath}"</script>`;

  // Inject the base path script right after <head> or before </head>
  let result = html.replace("<head>", `<head>${basePathScript}`);

  // Rewrite asset paths in src and href attributes
  result = result.replace(
    /(\s(?:src|href))="\/(?!\/)/g,
    `$1="${basePath}/`,
  );

  return result;
}

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
      const handler = await getServerModule();
      const fetchRequest = await toFetchRequest(req);
      const response = await handler.fetch(fetchRequest);

      // Set status and headers
      res.status(response.status);
      response.headers.forEach((value, key) => {
        // Skip content-length/content-encoding since we may modify the body
        if (
          key.toLowerCase() === "content-length" ||
          key.toLowerCase() === "content-encoding"
        ) {
          return;
        }
        res.setHeader(key, value);
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isHtml = contentType.includes("text/html");

      if (isHtml && response.body) {
        // Collect the full HTML body so we can rewrite it
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) chunks.push(result.value);
        }
        const html = Buffer.concat(chunks).toString("utf-8");
        const rewritten = rewriteHtml(html, basePath);
        res.setHeader("Content-Length", Buffer.byteLength(rewritten));
        res.end(rewritten);
      } else if (response.body) {
        // Stream non-HTML responses directly
        const reader = response.body.getReader();
        const pump = async (): Promise<void> => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          return pump();
        };
        await pump();
      } else {
        res.end();
      }
    } catch (error) {
      next(error);
    }
  };
}
