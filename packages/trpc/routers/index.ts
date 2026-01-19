import { router } from "../init";
import { alertRouter } from "./alert";
import { billingRouter } from "./billing";
import { onboardingRouter } from "./onboarding";
import { organizationRouter } from "./organization";
import { queueRouter } from "./queue";
import { redisConnectionRouter } from "./redis-connection";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  alert: alertRouter,
  billing: billingRouter,
  onboarding: onboardingRouter,
  organization: organizationRouter,
  queue: queueRouter,
  redisConnection: redisConnectionRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
