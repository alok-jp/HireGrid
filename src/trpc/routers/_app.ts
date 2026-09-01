import { createCallerFactory, router } from "../init";
import { invitationRouter } from "./invitation";
import { jobOpeningRouter } from "./jobOpenings";

export const appRouter = router({
  invitation: invitationRouter,
  jobOpening: jobOpeningRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
