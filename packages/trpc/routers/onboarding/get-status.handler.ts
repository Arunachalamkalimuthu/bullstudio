import { AuthedTRPCContext } from "../../types";

type GetOnboardingStatusHandlerProps = {
  ctx: AuthedTRPCContext;
};

export async function getOnboardingStatusHandler({
  ctx,
}: GetOnboardingStatusHandlerProps) {
  const { prisma, user } = ctx;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      hasCompletedOnboarding: true,
      name: true,
      organizationMemberships: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  return {
    hasCompletedOnboarding: dbUser?.hasCompletedOnboarding ?? false,
    userName: dbUser?.name,
    hasOrganization: (dbUser?.organizationMemberships.length ?? 0) > 0,
    organization: dbUser?.organizationMemberships[0]?.organization ?? null,
  };
}
