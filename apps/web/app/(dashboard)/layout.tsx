import { SidebarProvider, SidebarInset } from "@bullstudio/ui/components/sidebar";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasCompletedOnboarding: true },
  });

  if (!user?.hasCompletedOnboarding) {
    return redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
