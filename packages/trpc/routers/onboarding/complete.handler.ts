import { TRPCError } from "@trpc/server";
import {
  OrganizationMemberRole,
  WorkspaceMemberRole,
} from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../../types";
import { CompleteOnboardingInput } from "./complete.schema";
import { createCustomer, ensureCustomer } from "@bullstudio/billing";

type CompleteOnboardingHandlerProps = {
  ctx: AuthedTRPCContext;
  input: CompleteOnboardingInput;
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export async function completeOnboardingHandler({
  ctx,
  input,
}: CompleteOnboardingHandlerProps) {
  const { prisma, user } = ctx;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      hasCompletedOnboarding: true,
      name: true,
    },
  });

  if (dbUser?.hasCompletedOnboarding) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Onboarding has already been completed",
    });
  }

  let organizationName: string;
  let organizationSlug: string;

  if (input.accountType === "solo") {
    const userName = dbUser?.name || user.email.split("@")[0];
    organizationName = `${userName}'s Organization`;
    organizationSlug = generateSlug(`${userName}-org`);
  } else {
    if (!input.organizationName || !input.organizationSlug) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Organization name and slug are required for organization accounts",
      });
    }
    organizationName = input.organizationName;
    organizationSlug = input.organizationSlug;
  }

  const existingOrg = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (existingOrg) {
    const timestamp = Date.now().toString(36);
    organizationSlug = `${organizationSlug}-${timestamp}`;
  }

  const existingWorkspace = await prisma.workspace.findFirst({
    where: {
      organization: { slug: organizationSlug },
      slug: input.workspaceSlug,
    },
  });

  if (existingWorkspace) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A workspace with this slug already exists",
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        members: {
          create: {
            userId: user.id,
            role: OrganizationMemberRole.Owner,
          },
        },
      },
    });

    const customerId = await createCustomer({
      userId: user.id,
      email: user.email,
      name: organizationName,
      orgId: organization.id,
    });

    await tx.organization.update({
      where: { id: organization.id },
      data: { polarCustomerId: customerId },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: input.workspaceName,
        slug: input.workspaceSlug,
        organizationId: organization.id,
        members: {
          create: {
            userId: user.id,
            role: WorkspaceMemberRole.Owner,
          },
        },
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { hasCompletedOnboarding: true },
    });

    return { organization, workspace };
  });

  return result;
}
