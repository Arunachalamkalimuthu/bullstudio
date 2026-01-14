"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@bullstudio/ui/components/button";
import { Input } from "@bullstudio/ui/components/input";
import { Field, FieldError, FieldLabel } from "@bullstudio/ui/components/field";
import { UseOnboardingReturn } from "../hooks/use-onboarding";

const organizationSchema = z.object({
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

type OrganizationFormValues = z.infer<typeof organizationSchema>;

type OrganizationStepProps = {
  onboarding: UseOnboardingReturn;
};

export function OrganizationStep({ onboarding }: OrganizationStepProps) {
  const { data, updateData, goToNextStep, goToPreviousStep } = onboarding;

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<OrganizationFormValues>({
      resolver: zodResolver(organizationSchema),
      defaultValues: {
        name: data.organizationName,
        slug: data.organizationSlug,
      },
      mode: "onChange",
    });

  const name = watch("name");

  useEffect(() => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug, { shouldValidate: true });
  }, [name, setValue]);

  const onSubmit = (formData: OrganizationFormValues) => {
    updateData({
      organizationName: formData.name,
      organizationSlug: formData.slug,
    });
    goToNextStep();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Create your organization</h2>
        <p className="text-muted-foreground mt-2">
          Your organization is where you'll manage team members and workspaces
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Organization Name</FieldLabel>
              <Input {...field} placeholder="Acme Inc." />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Organization Slug</FieldLabel>
              <Input {...field} placeholder="acme-inc" />
              <p className="text-xs text-muted-foreground mt-1">
                This will be used in URLs
              </p>
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={goToPreviousStep}>
            Back
          </Button>
          <Button type="submit" disabled={!formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
