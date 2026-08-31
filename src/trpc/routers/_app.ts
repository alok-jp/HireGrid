import { router } from "../init";
import { invitationRouter } from "./invitation";


export const appRouter = router({
  invitation: invitationRouter,
});

export type AppRouter = typeof appRouter;
