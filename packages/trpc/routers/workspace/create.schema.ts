import { z } from "zod";

export const createWorkspaceSchema = z.object({
  organizationId: z.string(),
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

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
