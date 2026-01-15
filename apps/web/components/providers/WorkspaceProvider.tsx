"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export type WorkspaceProviderProps = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

const workspaceContext = createContext<WorkspaceProviderProps | null>(null);

export const WorkspaceProvider = (
  props: PropsWithChildren<WorkspaceProviderProps>
) => {
  const _props = useMemo(() => props, [props]);
  return (
    <workspaceContext.Provider value={_props}>
      {props.children}
    </workspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(workspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
