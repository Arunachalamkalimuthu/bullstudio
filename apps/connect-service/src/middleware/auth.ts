const API_KEY_HEADER = "x-api-key";

export interface AuthConfig {
  apiKey: string;
}

export function createAuthMiddleware(config: AuthConfig) {
  return function authenticate(
    request: Request
  ): Response | null {
    const providedKey = request.headers.get(API_KEY_HEADER);

    if (!providedKey) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Missing API key",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!secureCompare(providedKey, config.apiKey)) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid API key",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return null;
  };
}

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }

  return result === 0;
}
