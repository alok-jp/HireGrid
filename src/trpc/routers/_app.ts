import { createCallerFactory, router } from "../init";
import { applicationRouter } from "./application";
import { dashboardRouter } from "./dashboard";
import { interviewRouter } from "./interview";
import { invitationRouter } from "./invitation";
import { jobOpeningRouter } from "./jobOpenings";
import { userRouter } from "./user";

export const appRouter = router({
  invitation: invitationRouter,
  jobOpening: jobOpeningRouter,
  application: applicationRouter,
  user: userRouter,
  interview: interviewRouter,
  dashboard: dashboardRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
