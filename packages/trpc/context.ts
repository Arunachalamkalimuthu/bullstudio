import { auth, User } from "@bullstudio/auth";
import { prisma, PrismaClient, Session } from "@bullstudio/prisma";

export type TRPCContext = {
  prisma: PrismaClient;
  user: User | null;
};

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const session = await auth();
  const user = session?.user;
  return {
    prisma: prisma,
    user: user ?? null,
  };
};
