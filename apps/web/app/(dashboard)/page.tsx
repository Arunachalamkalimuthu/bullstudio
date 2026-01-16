import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { redirect } from "next/navigation";

const getDefaultOrganizationSlug = async (userId: string) => {
  const firstOrg = await prisma.organization.findFirst({
    where: { members: { some: { userId } } },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });
  return firstOrg?.slug;
};

export default async function DefaultPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const orgSlug = await getDefaultOrganizationSlug(session.user.id);
  if (!orgSlug) {
    return redirect("/onboarding");
  }

  console.log("Redirecting to organization:", orgSlug);

  return redirect(`/${orgSlug}`);
}
