"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@bullstudio/ui/components/button";
import { Input } from "@bullstudio/ui/components/input";
import { Field, FieldError, FieldLabel } from "@bullstudio/ui/components/field";
import { UseOnboardingReturn } from "../hooks/use-onboarding";

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

type WorkspaceStepProps = {
  onboarding: UseOnboardingReturn;
  onComplete: () => void;
  isSubmitting: boolean;
};

export function WorkspaceStep({
  onboarding,
  onComplete,
  isSubmitting,
}: WorkspaceStepProps) {
  const { data, updateData, goToPreviousStep, isFirstStep } = onboarding;

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<WorkspaceFormValues>({
      resolver: zodResolver(workspaceSchema),
      defaultValues: {
        name: data.workspaceName,
        slug: data.workspaceSlug,
      },
      mode: "onChange",
    });

  const name = watch("name");

  useEffect(() => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug, { shouldValidate: true, shouldDirty: true });
  }, [name, setValue]);

  const onSubmit = (formData: WorkspaceFormValues) => {
    updateData({
      workspaceName: formData.name,
      workspaceSlug: formData.slug,
    });
    onComplete();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Create your first workspace</h2>
        <p className="text-muted-foreground mt-2">
          Workspaces help you organize queues and connections for different
          projects or environments
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Workspace Name</FieldLabel>
              <Input {...field} placeholder="Production" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Workspace Slug</FieldLabel>
              <Input {...field} placeholder="production" />
              <p className="text-xs text-muted-foreground mt-1">
                This will be used in URLs
              </p>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isFirstStep || isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" disabled={!formState.isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Complete Setup"}
          </Button>
        </div>
      </form>
    </div>
  );
}
