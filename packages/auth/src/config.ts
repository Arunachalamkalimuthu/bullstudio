import { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { prisma } from "@bullstudio/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Resend({
      from: "noreply@scheduler.barbell-consulting.com",
    }),
    Google,
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        organizationId: session.user.organizationId ?? token.organizationId,
        emailVerified:
          session.user.emailVerified ?? token.emailVerified ?? null,
      };
      return session;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }

      if (trigger === "signIn" || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          include: {
            organizationMemberships: true,
          },
        });
        if (dbUser) {
          token = {
            ...token,
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            organizationId: dbUser.organizationMemberships[0]?.organizationId,
            emailVerified: dbUser.emailVerified ?? null,
          };
        }
      }
      return token;
    },
  },
};
