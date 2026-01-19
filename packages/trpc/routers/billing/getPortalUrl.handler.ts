import { getCustomerPortalUrl } from "@bullstudio/billing";
import { TRPCError } from "@trpc/server";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import type { GetPortalUrlInput } from "./getPortalUrl.schema";

type GetPortalUrlHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetPortalUrlInput;
};

export async function getPortalUrlHandler({
  ctx,
  input,
}: GetPortalUrlHandlerProps) {
  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  try {
    const portalUrl = await getCustomerPortalUrl(input.organizationId);
    return { portalUrl };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("does not have a Polar customer ID")
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subscription found for this organization",
      });
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Failed to get customer portal URL",
    });
  }
}
