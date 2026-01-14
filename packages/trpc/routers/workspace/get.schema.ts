import { z } from "zod";

export const getWorkspaceSchema = z.object({
  organizationId: z.string(),
  slug: z.string(),
});

export type GetWorkspaceInput = z.infer<typeof getWorkspaceSchema>;
