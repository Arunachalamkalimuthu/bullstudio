import type { Route } from "../lib/router";
import { jsonResponse } from "../lib/response";

export function createHealthRoutes(): Route[] {
  return [
    {
      method: "GET",
      path: "/health",
      handler: () => {
        return jsonResponse({ status: "ok", timestamp: Date.now() });
      },
    },
  ];
}
