"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  Plus,
  Settings,
  Folder,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bullstudio/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@bullstudio/ui/components/sidebar";
import { Skeleton } from "@bullstudio/ui/components/skeleton";
import { trpc } from "@/lib/trpc";
import { useDialogStore } from "@/components/dialog/store";
import { CreateWorkspaceDialog } from "@/components/dialog/registry";

export function WorkspaceSelector() {
  const router = useRouter();
  const params = useParams();
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const dialogStore = useDialogStore();

  const currentWorkspaceSlug = params.workspace as string | undefined;

  const { data: organizations, isLoading: isLoadingOrgs } =
    trpc.organization.list.useQuery();

  const currentOrganization = organizations?.[0];

  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    trpc.workspace.list.useQuery(
      { organizationId: currentOrganization?.id ?? "" },
      { enabled: !!currentOrganization?.id }
    );

  const currentWorkspace = useMemo(() => {
    if (!workspaces || !currentWorkspaceSlug) return workspaces?.[0];
    return workspaces.find((w) => w.slug === currentWorkspaceSlug);
  }, [workspaces, currentWorkspaceSlug]);

  const handleWorkspaceSelect = useCallback(
    (slug: string) => {
      router.push(`/${slug}`);
    },
    [router]
  );

  const handleCreateWorkspace = useCallback(() => {
    if (!currentOrganization) return;
    dialogStore.trigger({
      id: "create-workspace",
      component: CreateWorkspaceDialog,
      props: {
        organizationId: currentOrganization.id,
        onSuccess: () => {},
      },
    });
  }, [currentOrganization, dialogStore]);

  const handleWorkspaceSettings = useCallback(() => {
    if (!currentWorkspace) return;
    router.push(`/${currentWorkspace.slug}/settings`);
  }, [currentWorkspace, router]);

  const isLoading = isLoadingOrgs || isLoadingWorkspaces;

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <Skeleton className="size-8 rounded-lg" />
            {!isCollapsed && (
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-20" />
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentOrganization) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={
                isCollapsed
                  ? currentWorkspace?.name || "Select workspace"
                  : undefined
              }
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Folder className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentWorkspace?.name || "Select workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentOrganization.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="size-3" />
                {currentOrganization.name}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {workspaces && workspaces.length > 0 ? (
              <>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace.slug)}
                    className="cursor-pointer gap-2"
                  >
                    <Folder className="size-4" />
                    <span className="flex-1 truncate">{workspace.name}</span>
                    {workspace.id === currentWorkspace?.id && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                No workspaces yet
              </div>
            )}

            <DropdownMenuItem
              onClick={handleCreateWorkspace}
              className="cursor-pointer gap-2"
            >
              <Plus className="size-4" />
              <span>Create workspace</span>
            </DropdownMenuItem>

            {currentWorkspace && (
              <DropdownMenuItem
                onClick={handleWorkspaceSettings}
                className="cursor-pointer gap-2"
              >
                <Settings className="size-4" />
                <span>Workspace settings</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
