import { SessionProvider } from "@bullstudio/auth/react";
import { TRPCProvider } from "./TRPCProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TRPCProvider>
      <SessionProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </SessionProvider>
    </TRPCProvider>
  );
};
