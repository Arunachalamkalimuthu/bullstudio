import { AuthedTRPCContext } from "../../types";

type ListOrganizationsHandlerProps = {
  ctx: AuthedTRPCContext;
};

export async function listOrganizationsHandler({
  ctx,
}: ListOrganizationsHandlerProps) {
  const { prisma, user } = ctx;

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        where: {
          userId: user.id,
        },
        select: {
          role: true,
        },
      },
      _count: {
        select: {
          workspaces: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return organizations;
}
