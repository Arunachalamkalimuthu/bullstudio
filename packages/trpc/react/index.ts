import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../routers";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();

export { httpBatchLink } from "@trpc/client";
export { QueryClientProvider } from "@tanstack/react-query";
export { QueryClient } from "@tanstack/react-query";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
