import { authedProcedure, router } from "../../init";
import { listWorkspacesSchema } from "./list.schema";
import { listWorkspacesHandler } from "./list.handler";
import { getWorkspaceSchema } from "./get.schema";
import { getWorkspaceHandler } from "./get.handler";
import { createWorkspaceSchema } from "./create.schema";
import { createWorkspaceHandler } from "./create.handler";
import { updateWorkspaceSchema } from "./update.schema";
import { updateWorkspaceHandler } from "./update.handler";
import { deleteWorkspaceSchema } from "./delete.schema";
import { deleteWorkspaceHandler } from "./delete.handler";

export const workspaceRouter = router({
  list: authedProcedure.input(listWorkspacesSchema).query(({ ctx, input }) => {
    return listWorkspacesHandler({ ctx, input });
  }),

  get: authedProcedure.input(getWorkspaceSchema).query(({ ctx, input }) => {
    return getWorkspaceHandler({ ctx, input });
  }),

  create: authedProcedure
    .input(createWorkspaceSchema)
    .mutation(({ ctx, input }) => {
      return createWorkspaceHandler({ ctx, input });
    }),

  update: authedProcedure
    .input(updateWorkspaceSchema)
    .mutation(({ ctx, input }) => {
      return updateWorkspaceHandler({ ctx, input });
    }),

  delete: authedProcedure
    .input(deleteWorkspaceSchema)
    .mutation(({ ctx, input }) => {
      return deleteWorkspaceHandler({ ctx, input });
    }),
});
