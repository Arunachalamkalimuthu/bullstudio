import { z } from "zod";

export const completeOnboardingSchema = z.object({
  accountType: z.enum(["solo", "organization"]),
  organizationName: z.string().min(1).max(100).optional(),
  organizationSlug: z
    .string()
    .min(1)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  workspaceName: z.string().min(1, "Name is required").max(100, "Name is too long"),
  workspaceSlug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
