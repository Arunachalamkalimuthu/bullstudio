import { OrganizationMemberRole } from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../types";
import { TRPCError } from "@trpc/server";

type OrganizationGuardProps = {
  ctx: AuthedTRPCContext;
  organizationId: string;
  requiredRole?: OrganizationMemberRole;
};

export async function organizationGuard({
  ctx,
  organizationId,
  requiredRole,
}: OrganizationGuardProps) {
  const { prisma, user } = ctx;
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      members: true,
    },
  });

  if (!organization) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  const member = organization.members.find(
    (member) => member.userId === user.id,
  );
  if (!member) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "You are not a member of this organization",
    });
  }

  if (requiredRole && member.role !== requiredRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not authorized to access this organization",
    });
  }

  return {
    organization,
    member,
  };
}
