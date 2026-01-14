"use client";

import { useCallback, useMemo, useState } from "react";

export type AccountType = "solo" | "organization";

export type OnboardingData = {
  accountType: AccountType | null;
  organizationName: string;
  organizationSlug: string;
  workspaceName: string;
  workspaceSlug: string;
};

export type OnboardingStepId =
  | "account-type"
  | "organization"
  | "workspace";

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description: string;
  isOptional?: boolean;
  shouldSkip?: (data: OnboardingData) => boolean;
};

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: "account-type",
    title: "Account Type",
    description: "Choose how you'll use bullstudio",
  },
  {
    id: "organization",
    title: "Create Organization",
    description: "Set up your organization",
    shouldSkip: (data) => data.accountType === "solo",
  },
  {
    id: "workspace",
    title: "Create Workspace",
    description: "Set up your first workspace",
  },
];

const INITIAL_DATA: OnboardingData = {
  accountType: null,
  organizationName: "",
  organizationSlug: "",
  workspaceName: "",
  workspaceSlug: "",
};

export function useOnboarding(steps: OnboardingStep[] = DEFAULT_STEPS) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const activeSteps = useMemo(() => {
    return steps.filter((step) => !step.shouldSkip?.(data));
  }, [steps, data]);

  const currentStep = activeSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  const progress = useMemo(() => {
    return ((currentStepIndex + 1) / activeSteps.length) * 100;
  }, [currentStepIndex, activeSteps.length]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback(
    (stepId: OnboardingStepId) => {
      const index = activeSteps.findIndex((s) => s.id === stepId);
      if (index !== -1) {
        setCurrentStepIndex(index);
      }
    },
    [activeSteps]
  );

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setData(INITIAL_DATA);
  }, []);

  return {
    currentStep,
    currentStepIndex,
    activeSteps,
    totalSteps: activeSteps.length,
    isFirstStep,
    isLastStep,
    progress,
    data,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    reset,
  };
}

export type UseOnboardingReturn = ReturnType<typeof useOnboarding>;
