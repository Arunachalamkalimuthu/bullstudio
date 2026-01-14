export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteHandler = (
  request: Request,
  params: Record<string, string>
) => Promise<Response> | Response;

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
}

interface CompiledRoute {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: CompiledRoute[] = [];

  register(routes: Route[]): void {
    for (const route of routes) {
      this.routes.push(this.compileRoute(route));
    }
  }

  async handle(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method as HttpMethod;

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const match = path.match(route.pattern);
      if (!match) {
        continue;
      }

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, index) => {
        const value = match[index + 1];
        if (value) {
          params[name] = decodeURIComponent(value);
        }
      });

      return route.handler(request, params);
    }

    return null;
  }

  private compileRoute(route: Route): CompiledRoute {
    const paramNames: string[] = [];
    const patternStr = route.path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    });

    return {
      method: route.method,
      pattern: new RegExp(`^${patternStr}$`),
      paramNames,
      handler: route.handler,
    };
  }
}
