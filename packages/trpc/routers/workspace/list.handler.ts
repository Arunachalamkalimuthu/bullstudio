import { AuthedTRPCContext } from "../../types";
import { organizationGuard } from "../../guards/organization";
import { ListWorkspacesInput } from "./list.schema";

type ListWorkspacesHandlerProps = {
  ctx: AuthedTRPCContext;
  input: ListWorkspacesInput;
};

export async function listWorkspacesHandler({
  ctx,
  input,
}: ListWorkspacesHandlerProps) {
  const { prisma, user } = ctx;

  await organizationGuard({
    ctx,
    organizationId: input.organizationId,
  });

  const workspaces = await prisma.workspace.findMany({
    where: {
      organizationId: input.organizationId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          redisConnection: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return workspaces;
}
