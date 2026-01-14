"use client";

import { User, Users } from "lucide-react";
import { cn } from "@bullstudio/ui/lib/utils";
import { AccountType, UseOnboardingReturn } from "../hooks/use-onboarding";

type AccountTypeOption = {
  type: AccountType;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const accountTypeOptions: AccountTypeOption[] = [
  {
    type: "solo",
    title: "Solo Developer",
    description: "I'm working alone on personal or freelance projects",
    icon: <User className="size-6" />,
  },
  {
    type: "organization",
    title: "Organization",
    description: "I'm part of a team and want to collaborate with others",
    icon: <Users className="size-6" />,
  },
];

type AccountTypeStepProps = {
  onboarding: UseOnboardingReturn;
};

export function AccountTypeStep({ onboarding }: AccountTypeStepProps) {
  const { data, updateData, goToNextStep } = onboarding;

  const handleSelect = (type: AccountType) => {
    updateData({ accountType: type });
    goToNextStep();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">How will you use bullstudio?</h2>
        <p className="text-muted-foreground mt-2">
          This helps us personalize your experience
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accountTypeOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelect(option.type)}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-lg border-2 transition-all",
              "hover:border-primary hover:bg-accent",
              data.accountType === option.type
                ? "border-primary bg-accent"
                : "border-border"
            )}
          >
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              {option.icon}
            </div>
            <div className="text-center">
              <h3 className="font-medium">{option.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
