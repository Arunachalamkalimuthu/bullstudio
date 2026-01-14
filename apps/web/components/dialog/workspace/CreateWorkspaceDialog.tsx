"use client";

import { useEffect } from "react";
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

const createWorkspaceSchema = z.object({
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

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export type CreateWorkspaceDialogProps = {
  organizationId: string;
  onSuccess?: () => void;
};

export function CreateWorkspaceDialog({
  organizationId,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const { open, onOpenChange } = useDialogContext();
  const utils = trpc.useUtils();

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<CreateWorkspaceFormValues>({
      resolver: zodResolver(createWorkspaceSchema),
      defaultValues: {
        name: "",
        slug: "",
      },
      mode: "onChange",
    });

  const name = watch("name");

  useEffect(() => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug, { shouldValidate: true });
  }, [name, setValue]);

  const createWorkspace = trpc.workspace.create.useMutation({
    onSuccess: () => {
      toast.success("Workspace created successfully");
      utils.workspace.list.invalidate();
      onSuccess?.();
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateWorkspaceFormValues) => {
    createWorkspace.mutate({
      organizationId,
      name: data.name,
      slug: data.slug,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your queues and connections.
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
              {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
