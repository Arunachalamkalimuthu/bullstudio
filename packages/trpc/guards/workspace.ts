import { WorkspaceMemberRole } from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../types";
import { TRPCError } from "@trpc/server";

type WorkspaceGuardProps = {
  ctx: AuthedTRPCContext;
  workspaceId: string;
  requiredRole?: WorkspaceMemberRole;
};

export async function workspaceGuard({
  ctx,
  workspaceId,
  requiredRole,
}: WorkspaceGuardProps) {
  const { prisma, user } = ctx;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      organization: true,
      members: true,
    },
  });

  if (!workspace) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });
  }

  const member = workspace.members.find((member) => member.userId === user.id);

  if (!member) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "You are not a member of this workspace",
    });
  }

  if (
    member.role !== WorkspaceMemberRole.Owner &&
    requiredRole &&
    member.role !== requiredRole
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not authorized to access this workspace",
    });
  }

  return {
    workspace,
    member,
  };
}
