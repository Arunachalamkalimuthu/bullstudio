import { z } from "zod";

export const listWorkspacesSchema = z.object({
  organizationId: z.string(),
});

export type ListWorkspacesInput = z.infer<typeof listWorkspacesSchema>;
