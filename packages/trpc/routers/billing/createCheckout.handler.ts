import { createCheckoutUrl } from "@bullstudio/billing";
import { SubscriptionPlan } from "@bullstudio/prisma";
import { TRPCError } from "@trpc/server";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import type { CreateCheckoutInput } from "./createCheckout.schema";

type CreateCheckoutHandlerProps = {
  ctx: AuthedTRPCContext;
  input: CreateCheckoutInput;
};

export async function createCheckoutHandler({
  ctx,
  input,
}: CreateCheckoutHandlerProps) {
  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  try {
    const checkoutUrl = await createCheckoutUrl(
      input.organizationId,
      input.plan as SubscriptionPlan
    );
    return { checkoutUrl };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    });
  }
}
