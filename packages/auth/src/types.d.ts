import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    organizationId?: string;
    email: string;
    name?: string | null;
    emailVerified?: Date | null;
  }

  interface Session {
    user: User;
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface JWT {
    id: string;
    organizationId?: string;
    email: string;
    name?: string | null;
    emailVerified?: Date | null;
  }
}
