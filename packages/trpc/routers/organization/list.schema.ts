import { z } from "zod";

export const listOrganizationsSchema = z.object({}).optional();

export type ListOrganizationsInput = z.infer<typeof listOrganizationsSchema>;
