import { fetchRequestHandler } from "@bullstudio/trpc/fetch";
import { appRouter } from "@bullstudio/trpc/routers";
import { createTRPCContext } from "@bullstudio/trpc/context";
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
