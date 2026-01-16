import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { notFound, redirect } from "next/navigation";

const getCurrentWorkspace = async (
  userId: string,
  orgSlug: string,
  workspaceSlug: string
) => {
  // Placeholder function to simulate fetching workspace data
  const ws = await prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      organization: { slug: orgSlug },
      members: { some: { userId } },
    },
    select: { id: true, name: true, slug: true },
  });
  return ws;
};

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string; workspace: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const { organizationSlug, workspace: workspaceSlug } = await params;

  const workspace = await getCurrentWorkspace(
    session.user.id,
    organizationSlug,
    workspaceSlug
  );

  if (!workspace) {
    return notFound();
  }

  return (
    <WorkspaceProvider
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
    >
      {children}
    </WorkspaceProvider>
  );
}
