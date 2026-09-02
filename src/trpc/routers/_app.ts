import { createCallerFactory, router } from "../init";
import { invitationRouter } from "./invitation";
import { jobOpeningRouter } from "./jobOpenings";
import { applicationRouter } from "./application";
import { userRouter } from "./user";

export const appRouter = router({
  invitation: invitationRouter,
  jobOpening: jobOpeningRouter,
  application: applicationRouter,
  user: userRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
