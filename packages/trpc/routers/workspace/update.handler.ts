import { TRPCError } from "@trpc/server";
import { WorkspaceMemberRole } from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../../types";
import { workspaceGuard } from "../../guards/workspace";
import { UpdateWorkspaceInput } from "./update.schema";

type UpdateWorkspaceHandlerProps = {
  ctx: AuthedTRPCContext;
  input: UpdateWorkspaceInput;
};

export async function updateWorkspaceHandler({
  ctx,
  input,
}: UpdateWorkspaceHandlerProps) {
  const { prisma } = ctx;

  const { workspace } = await workspaceGuard({
    ctx,
    workspaceId: input.workspaceId,
    requiredRole: WorkspaceMemberRole.Owner,
  });

  if (input.slug !== workspace.slug) {
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        organizationId_slug: {
          organizationId: workspace.organizationId,
          slug: input.slug,
        },
      },
    });

    if (existingWorkspace) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A workspace with this slug already exists",
      });
    }
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: input.workspaceId },
    data: {
      name: input.name,
      slug: input.slug,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return updatedWorkspace;
}
