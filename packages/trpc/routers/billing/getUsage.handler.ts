import { getOrganizationUsage } from "@bullstudio/billing";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import type { GetUsageInput } from "./getUsage.schema";

type GetUsageHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetUsageInput;
};

export async function getUsageHandler({ ctx, input }: GetUsageHandlerProps) {
  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  return getOrganizationUsage(input.organizationId);
}
