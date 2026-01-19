import { getSubscriptionDetails } from "@bullstudio/billing";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import type { GetSubscriptionInput } from "./getSubscription.schema";

type GetSubscriptionHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetSubscriptionInput;
};

export async function getSubscriptionHandler({
  ctx,
  input,
}: GetSubscriptionHandlerProps) {
  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  return getSubscriptionDetails(input.organizationId);
}
