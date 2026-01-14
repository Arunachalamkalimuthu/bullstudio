export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function errorResponse(
  message: string,
  error: unknown,
  status: number = 500
): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Error] ${message}: ${errorMessage}`);

  return jsonResponse(
    {
      error: message,
      details: errorMessage,
    },
    status
  );
}
