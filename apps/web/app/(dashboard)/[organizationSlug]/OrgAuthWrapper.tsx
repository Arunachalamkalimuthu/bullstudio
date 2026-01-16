import { OrganizationProvider } from "@/components/providers/OrganizationProvider";
import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { notFound, redirect } from "next/navigation";

export default async function OrgAuthWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const { organizationSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
    select: {
      id: true,
      members: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!org || org.members.length === 0) {
    return notFound();
  }

  return (
    <OrganizationProvider
      orgId={org.id}
      orgName={organizationSlug}
      orgSlug={organizationSlug}
    >
      {children}
    </OrganizationProvider>
  );
}
