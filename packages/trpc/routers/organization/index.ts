import { authedProcedure, router } from "../../init";
import { listOrganizationsHandler } from "./list.handler";

export const organizationRouter = router({
  list: authedProcedure.query(({ ctx }) => {
    return listOrganizationsHandler({ ctx });
  }),
});
