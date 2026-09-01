import { createCallerFactory, router } from "../init";
import { invitationRouter } from "./invitation";
import { jobOpeningRouter } from "./jobOpenings";
import { applicationRouter } from "./application";

export const appRouter = router({
  invitation: invitationRouter,
  jobOpening: jobOpeningRouter,
  application: applicationRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
