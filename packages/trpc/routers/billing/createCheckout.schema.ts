import { z } from "zod";

export const createCheckoutSchema = z.object({
  organizationId: z.string(),
  plan: z.enum(["Pro", "Enterprise"]),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
