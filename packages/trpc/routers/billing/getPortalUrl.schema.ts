import { z } from "zod";

export const getPortalUrlSchema = z.object({
  organizationId: z.string(),
});

export type GetPortalUrlInput = z.infer<typeof getPortalUrlSchema>;
