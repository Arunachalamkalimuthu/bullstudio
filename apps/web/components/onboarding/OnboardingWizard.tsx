"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@bullstudio/ui/components/card";
import { Progress } from "@bullstudio/ui/components/progress";
import { toast } from "@bullstudio/ui/components/sonner";
import { trpc } from "@/lib/trpc";
import { useOnboarding } from "./hooks/use-onboarding";
import { AccountTypeStep } from "./steps/AccountTypeStep";
import { OrganizationStep } from "./steps/OrganizationStep";
import { WorkspaceStep } from "./steps/WorkspaceStep";

export function OnboardingWizard() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const { currentStep, progress, data, activeSteps, currentStepIndex } =
    onboarding;

  const completeOnboarding = trpc.onboarding.complete.useMutation({
    onSuccess: (result) => {
      toast.success("Welcome to bullstudio!");
      router.push(`/${result.organization.slug}/${result.workspace.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleComplete = async () => {
    if (!data.accountType) return;

    await completeOnboarding.mutateAsync({
      accountType: data.accountType,
      organizationName: data.organizationName || undefined,
      organizationSlug: data.organizationSlug || undefined,
      workspaceName: data.workspaceName,
      workspaceSlug: data.workspaceSlug,
    });
  };

  const renderStep = () => {
    switch (currentStep?.id) {
      case "account-type":
        return <AccountTypeStep onboarding={onboarding} />;
      case "organization":
        return <OrganizationStep onboarding={onboarding} />;
      case "workspace":
        return (
          <WorkspaceStep
            onboarding={onboarding}
            onComplete={handleComplete}
            isSubmitting={completeOnboarding.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-lg">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStepIndex + 1} of {activeSteps.length}
          </span>
          <span>{currentStep?.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
