import { prisma } from "@bullstudio/prisma";
import { getPlanLimits } from "../../plans";

export type OrganizationUsage = {
  workspaces: {
    current: number;
    limit: number;
  };
  connections: {
    current: number;
    limit: number;
  };
  alertsEnabled: boolean;
};

export async function getOrganizationUsage(
  orgId: string
): Promise<OrganizationUsage> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      subscriptionPlan: true,
      workspaces: {
        select: {
          id: true,
          redisConnection: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!org) {
    throw new Error(`Organization with id ${orgId} not found`);
  }

  const limits = getPlanLimits(org.subscriptionPlan);
  const workspaceCount = org.workspaces.length;
  const connectionCount = org.workspaces.reduce(
    (acc, workspace) => acc + workspace.redisConnection.length,
    0
  );

  return {
    workspaces: {
      current: workspaceCount,
      limit: limits.workspaces,
    },
    connections: {
      current: connectionCount,
      limit: limits.connections,
    },
    alertsEnabled: limits.alertsEnabled,
  };
}

export async function canCreateWorkspace(orgId: string): Promise<boolean> {
  const usage = await getOrganizationUsage(orgId);
  return usage.workspaces.current < usage.workspaces.limit;
}

export async function canCreateConnection(workspaceId: string): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organizationId: true },
  });

  if (!workspace) {
    throw new Error(`Workspace with id ${workspaceId} not found`);
  }

  const usage = await getOrganizationUsage(workspace.organizationId);
  return usage.connections.current < usage.connections.limit;
}

export async function canAccessAlerts(workspaceId: string): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organizationId: true },
  });

  if (!workspace) {
    throw new Error(`Workspace with id ${workspaceId} not found`);
  }

  const usage = await getOrganizationUsage(workspace.organizationId);
  return usage.alertsEnabled;
}
