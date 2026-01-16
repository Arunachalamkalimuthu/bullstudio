import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { redirect } from "next/navigation";

const getDefaultWorkspaceSlug = async (organizationSlug: string) => {
  const workspace = await prisma.workspace.findFirst({
    where: { organization: { slug: organizationSlug } },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });
  return workspace?.slug;
};

export default async function OrgDefaultPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const { organizationSlug } = await params;

  const workspaceSlug = await getDefaultWorkspaceSlug(organizationSlug);
  if (!workspaceSlug) {
    return redirect(`/${organizationSlug}/onboarding`);
  }

  return redirect(`/${organizationSlug}/${workspaceSlug}`);
}
