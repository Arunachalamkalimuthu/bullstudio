import { TRPCError } from "@trpc/server";
import { WorkspaceMemberRole } from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import { workspaceLimitGuard } from "../../guards/billing";
import { CreateWorkspaceInput } from "./create.schema";

type CreateWorkspaceHandlerProps = {
  ctx: AuthedTRPCContext;
  input: CreateWorkspaceInput;
};

export async function createWorkspaceHandler({
  ctx,
  input,
}: CreateWorkspaceHandlerProps) {
  const { prisma, user } = ctx;

  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  // Check billing limits
  await workspaceLimitGuard(input.organizationId);

  const existingWorkspace = await prisma.workspace.findUnique({
    where: {
      organizationId_slug: {
        organizationId: input.organizationId,
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

  const workspace = await prisma.workspace.create({
    data: {
      name: input.name,
      slug: input.slug,
      organizationId: input.organizationId,
      members: {
        create: {
          userId: user.id,
          role: WorkspaceMemberRole.Owner,
        },
      },
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

  return workspace;
}
