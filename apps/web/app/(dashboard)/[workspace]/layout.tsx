import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { notFound, redirect } from "next/navigation";
import { StringFormatParams } from "zod/v4/core";

const getCurrentWorkspace = async (userId: string, workspaceSlug: string) => {
  // Placeholder function to simulate fetching workspace data
  const ws = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId } } },
    select: { id: true, name: true, slug: true },
  });
  return ws;
};

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const { workspace: workspaceSlug } = await params;

  const workspace = await getCurrentWorkspace(session.user.id, workspaceSlug);

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
