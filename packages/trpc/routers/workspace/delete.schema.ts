import { z } from "zod";

export const deleteWorkspaceSchema = z.object({
  workspaceId: z.string(),
});

export type DeleteWorkspaceInput = z.infer<typeof deleteWorkspaceSchema>;
