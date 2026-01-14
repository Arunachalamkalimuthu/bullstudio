import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export {
  PrismaClient,
  type PrismaClient as PrismaClientType,
} from "./generated/client/client";
export * from "./generated/client/client";
