import { createCallerFactory, router } from "../init";
import { invitationRouter } from "./invitation";

export const appRouter = router({
  invitation: invitationRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
