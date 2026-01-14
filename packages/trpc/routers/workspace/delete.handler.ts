import { WorkspaceMemberRole } from "@bullstudio/prisma";
import { AuthedTRPCContext } from "../../types";
import { workspaceGuard } from "../../guards/workspace";
import { DeleteWorkspaceInput } from "./delete.schema";

type DeleteWorkspaceHandlerProps = {
  ctx: AuthedTRPCContext;
  input: DeleteWorkspaceInput;
};

export async function deleteWorkspaceHandler({
  ctx,
  input,
}: DeleteWorkspaceHandlerProps) {
  const { prisma } = ctx;

  await workspaceGuard({
    ctx,
    workspaceId: input.workspaceId,
    requiredRole: WorkspaceMemberRole.Owner,
  });

  await prisma.workspace.delete({
    where: { id: input.workspaceId },
  });

  return { success: true };
}
