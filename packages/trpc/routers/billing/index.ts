import { authedProcedure, router } from "../../init";
import { getSubscriptionSchema } from "./getSubscription.schema";
import { getSubscriptionHandler } from "./getSubscription.handler";
import { getUsageSchema } from "./getUsage.schema";
import { getUsageHandler } from "./getUsage.handler";
import { createCheckoutSchema } from "./createCheckout.schema";
import { createCheckoutHandler } from "./createCheckout.handler";
import { getPortalUrlSchema } from "./getPortalUrl.schema";
import { getPortalUrlHandler } from "./getPortalUrl.handler";

export const billingRouter = router({
  getSubscription: authedProcedure
    .input(getSubscriptionSchema)
    .query(({ ctx, input }) => {
      return getSubscriptionHandler({ ctx, input });
    }),

  getUsage: authedProcedure.input(getUsageSchema).query(({ ctx, input }) => {
    return getUsageHandler({ ctx, input });
  }),

  createCheckout: authedProcedure
    .input(createCheckoutSchema)
    .mutation(({ ctx, input }) => {
      return createCheckoutHandler({ ctx, input });
    }),

  getPortalUrl: authedProcedure
    .input(getPortalUrlSchema)
    .query(({ ctx, input }) => {
      return getPortalUrlHandler({ ctx, input });
    }),
});
