import { authedProcedure, router } from "../../init";
import { getOnboardingStatusHandler } from "./get-status.handler";
import { completeOnboardingSchema } from "./complete.schema";
import { completeOnboardingHandler } from "./complete.handler";

export const onboardingRouter = router({
  getStatus: authedProcedure.query(({ ctx }) => {
    return getOnboardingStatusHandler({ ctx });
  }),

  complete: authedProcedure
    .input(completeOnboardingSchema)
    .mutation(({ ctx, input }) => {
      return completeOnboardingHandler({ ctx, input });
    }),
});
