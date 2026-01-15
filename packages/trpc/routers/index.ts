import { router } from "../init";
import { onboardingRouter } from "./onboarding";
import { organizationRouter } from "./organization";
import { queueRouter } from "./queue";
import { redisConnectionRouter } from "./redis-connection";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  onboarding: onboardingRouter,
  organization: organizationRouter,
  queue: queueRouter,
  redisConnection: redisConnectionRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
