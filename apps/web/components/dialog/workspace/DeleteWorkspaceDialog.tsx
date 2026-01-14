"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@bullstudio/ui/components/alert-dialog";
import { toast } from "@bullstudio/ui/components/sonner";
import { trpc } from "@/lib/trpc";
import { useDialogContext } from "../DialogProvider";

export type DeleteWorkspaceDialogProps = {
  workspaceId: string;
  workspaceName: string;
  onSuccess?: () => void;
};

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  onSuccess,
}: DeleteWorkspaceDialogProps) {
  const { open, onOpenChange } = useDialogContext();
  const utils = trpc.useUtils();

  const deleteWorkspace = trpc.workspace.delete.useMutation({
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      utils.workspace.list.invalidate();
      onSuccess?.();
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    deleteWorkspace.mutate({ workspaceId });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{workspaceName}</strong>?
            This action cannot be undone. All data associated with this
            workspace will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteWorkspace.isPending ? "Deleting..." : "Delete Workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
