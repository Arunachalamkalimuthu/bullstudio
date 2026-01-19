import { z } from "zod";

export const getSubscriptionSchema = z.object({
  organizationId: z.string(),
});

export type GetSubscriptionInput = z.infer<typeof getSubscriptionSchema>;
