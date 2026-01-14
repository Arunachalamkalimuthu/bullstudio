"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@bullstudio/ui/components/dialog";
import { Button } from "@bullstudio/ui/components/button";
import { Input } from "@bullstudio/ui/components/input";
import { Field, FieldError, FieldLabel } from "@bullstudio/ui/components/field";
import { toast } from "@bullstudio/ui/components/sonner";
import { trpc } from "@/lib/trpc";
import { useDialogContext } from "../DialogProvider";

const editWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

type EditWorkspaceFormValues = z.infer<typeof editWorkspaceSchema>;

export type EditWorkspaceDialogProps = {
  workspaceId: string;
  currentName: string;
  currentSlug: string;
  onSuccess?: () => void;
};

export function EditWorkspaceDialog({
  workspaceId,
  currentName,
  currentSlug,
  onSuccess,
}: EditWorkspaceDialogProps) {
  const { open, onOpenChange } = useDialogContext();
  const utils = trpc.useUtils();

  const { control, handleSubmit, formState } = useForm<EditWorkspaceFormValues>(
    {
      resolver: zodResolver(editWorkspaceSchema),
      defaultValues: {
        name: currentName,
        slug: currentSlug,
      },
      mode: "onChange",
    }
  );

  const updateWorkspace = trpc.workspace.update.useMutation({
    onSuccess: () => {
      toast.success("Workspace updated successfully");
      utils.workspace.list.invalidate();
      onSuccess?.();
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EditWorkspaceFormValues) => {
    updateWorkspace.mutate({
      workspaceId,
      name: data.name,
      slug: data.slug,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>
            Update your workspace name and slug.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>
                <Input {...field} placeholder="My Workspace" />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Slug</FieldLabel>
                <Input {...field} placeholder="my-workspace" />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isValid}
            >
              {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
