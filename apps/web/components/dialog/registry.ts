import dynamic from "next/dynamic";

export const CreateWorkspaceDialog = dynamic(
  () =>
    import("./workspace/CreateWorkspaceDialog").then(
      (mod) => mod.CreateWorkspaceDialog
    ),
  { ssr: false }
);

export const EditWorkspaceDialog = dynamic(
  () =>
    import("./workspace/EditWorkspaceDialog").then(
      (mod) => mod.EditWorkspaceDialog
    ),
  { ssr: false }
);

export const DeleteWorkspaceDialog = dynamic(
  () =>
    import("./workspace/DeleteWorkspaceDialog").then(
      (mod) => mod.DeleteWorkspaceDialog
    ),
  { ssr: false }
);
