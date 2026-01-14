import { router } from "../init";
import { onboardingRouter } from "./onboarding";
import { organizationRouter } from "./organization";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  onboarding: onboardingRouter,
  organization: organizationRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
