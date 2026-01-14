import { TRPCContext } from "./context";

export type AuthedUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  organizationId?: string;
  emailVerified?: Date | null;
};

export type AuthedTRPCContext = Omit<TRPCContext, "user"> & {
  user: AuthedUser;
};

export type AuthedTRPCContextProps<TInput = unknown> = {
  ctx: AuthedTRPCContext;
  input: TInput;
};
