import { TRPCError } from "@trpc/server";
import {
  canCreateWorkspace,
  canCreateConnection,
  canAccessAlerts,
  getOrganizationUsage,
} from "@bullstudio/billing";
import { prisma } from "@bullstudio/prisma";

export async function workspaceLimitGuard(orgId: string): Promise<void> {
  const canCreate = await canCreateWorkspace(orgId);

  if (!canCreate) {
    const usage = await getOrganizationUsage(orgId);
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Workspace limit reached. Your plan allows ${usage.workspaces.limit} workspace${usage.workspaces.limit === 1 ? "" : "s"}. Please upgrade to create more workspaces.`,
    });
  }
}

export async function connectionLimitGuard(workspaceId: string): Promise<void> {
  const canCreate = await canCreateConnection(workspaceId);

  if (!canCreate) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    const usage = await getOrganizationUsage(workspace.organizationId);
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Connection limit reached. Your plan allows ${usage.connections.limit} connection${usage.connections.limit === 1 ? "" : "s"}. Please upgrade to create more connections.`,
    });
  }
}

export async function alertAccessGuard(workspaceId: string): Promise<void> {
  const canAccess = await canAccessAlerts(workspaceId);

  if (!canAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Alerts are not available on your current plan. Please upgrade to Pro or Enterprise to use alerts.",
    });
  }
}
