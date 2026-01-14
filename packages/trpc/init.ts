import { initTRPC, TRPCError } from "@trpc/server";
import { TRPCContext } from "./context";
import superjson from "superjson";
import { AuthedTRPCContext, AuthedUser } from "./types";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      message: error.message,
    };
  },
});

export const authedProcedure = t.procedure.use((args) => {
  const { ctx, next } = args;
  const user = ctx.user;
  if (!user || !user.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const authedUser: AuthedUser = {
    id: user.id,
    email: user.email!,
    name: user.name,
    image: user.image,
  };

  return next({
    ctx: { ...ctx, user: authedUser } satisfies AuthedTRPCContext,
  });
});

export const router = t.router;
export const callerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
