import { TRPCError } from "@trpc/server";
import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import { GetWorkspaceInput } from "./get.schema";

type GetWorkspaceHandlerProps = {
  ctx: AuthedTRPCContext;
  input: GetWorkspaceInput;
};

export async function getWorkspaceHandler({
  ctx,
  input,
}: GetWorkspaceHandlerProps) {
  const { prisma, user } = ctx;

  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  const workspace = await prisma.workspace.findUnique({
    where: {
      organizationId_slug: {
        organizationId: input.organizationId,
        slug: input.slug,
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
      _count: {
        select: {
          redisConnection: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });
  }

  const isMember = workspace.members.some((m) => m.userId === user.id);
  if (!isMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this workspace",
    });
  }

  return workspace;
}
