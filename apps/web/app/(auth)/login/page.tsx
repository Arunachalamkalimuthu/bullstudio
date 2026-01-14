import { LoginCard } from "@/components/auth/LoginCard";
import { auth } from "@bullstudio/auth";
import { prisma } from "@bullstudio/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true },
    });

    if (user?.hasCompletedOnboarding) {
      return redirect("/");
    }
    return redirect("/onboarding");
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h3 className="text-2xl text-center font-bold">Sign in to bullstudio</h3>
      <LoginCard />
      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link className="text-primary underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
