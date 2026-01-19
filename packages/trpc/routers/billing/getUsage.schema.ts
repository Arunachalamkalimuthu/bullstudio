import { z } from "zod";

export const getUsageSchema = z.object({
  organizationId: z.string(),
});

export type GetUsageInput = z.infer<typeof getUsageSchema>;
