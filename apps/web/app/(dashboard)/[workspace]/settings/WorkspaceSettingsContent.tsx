"use client";

import { useRouter } from "next/navigation";
import { Settings, Trash2, Pencil, Users } from "lucide-react";
import { Button } from "@bullstudio/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bullstudio/ui/components/card";
import { Skeleton } from "@bullstudio/ui/components/skeleton";
import { Badge } from "@bullstudio/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@bullstudio/ui/components/avatar";
import { trpc } from "@/lib/trpc";
import { useDialogStore } from "@/components/dialog/store";
import {
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
} from "@/components/dialog/registry";

type WorkspaceSettingsContentProps = {
  workspaceSlug: string;
};

export function WorkspaceSettingsContent({
  workspaceSlug,
}: WorkspaceSettingsContentProps) {
  const router = useRouter();
  const dialogStore = useDialogStore();

  const { data: organizations, isLoading: isLoadingOrgs } =
    trpc.organization.list.useQuery();

  const currentOrganization = organizations?.[0];

  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    error,
  } = trpc.workspace.get.useQuery(
    {
      organizationId: currentOrganization?.id ?? "",
      slug: workspaceSlug,
    },
    { enabled: !!currentOrganization?.id }
  );

  const handleEditWorkspace = () => {
    if (!workspace) return;
    dialogStore.trigger({
      id: "edit-workspace",
      component: EditWorkspaceDialog,
      props: {
        workspaceId: workspace.id,
        currentName: workspace.name,
        currentSlug: workspace.slug,
        onSuccess: () => {
          if (workspace.slug !== workspaceSlug) {
            router.push(`/${workspace.slug}/settings`);
          }
        },
      },
    });
  };

  const handleDeleteWorkspace = () => {
    if (!workspace) return;
    dialogStore.trigger({
      id: "delete-workspace",
      component: DeleteWorkspaceDialog,
      props: {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  if (isLoadingOrgs || isLoadingWorkspace) {
    return (
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Workspace not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Settings className="size-5" />
              </div>
              <div>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>/{workspace.slug}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditWorkspace}>
              <Pencil className="size-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Organization</dt>
              <dd className="font-medium">{currentOrganization?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Redis Connections</dt>
              <dd className="font-medium">{workspace._count.redisConnection}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Members</dt>
              <dd className="font-medium">{workspace.members.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Members</CardTitle>
              <CardDescription>
                People who have access to this workspace
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {workspace.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name || member.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={member.role === "Owner" ? "default" : "secondary"}>
                  {member.role}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trash2 className="size-5 text-destructive" />
            <div>
              <CardTitle className="text-base text-destructive">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete this workspace</p>
              <p className="text-sm text-muted-foreground">
                Once you delete a workspace, there is no going back.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteWorkspace}>
              Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) return "U";
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const firstChar = first.charAt(0);
  const lastChar = last?.charAt(0) ?? "";
  return (firstChar + lastChar).toUpperCase();
}
