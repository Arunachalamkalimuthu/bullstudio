import { auth } from "@bullstudio/auth";
import { redirect } from "next/navigation";
import { prisma } from "@bullstudio/prisma";
import { OnboardingWizard } from "@/components/onboarding";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasCompletedOnboarding: true },
  });

  if (user?.hasCompletedOnboarding) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to bullstudio</h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s get you set up in just a few steps
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
