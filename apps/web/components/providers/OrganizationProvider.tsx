"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export type OrganizationProviderProps = {
  orgId: string;
  orgName: string;
  orgSlug: string;
};

const organizationContext = createContext<OrganizationProviderProps | null>(
  null
);

export const OrganizationProvider = (
  props: PropsWithChildren<OrganizationProviderProps>
) => {
  const _props = useMemo(() => props, [props]);
  return (
    <organizationContext.Provider value={_props}>
      {props.children}
    </organizationContext.Provider>
  );
};

export const useOrganizationContext = () => {
  const context = useContext(organizationContext);
  if (!context) {
    throw new Error(
      "useOrganizationContext must be used within an OrganizationProvider"
    );
  }
  return context;
};
