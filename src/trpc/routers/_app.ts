import { createCallerFactory, router } from "../init";
import { invitationRouter } from "./invitation";
import { jobOpeningRouter } from "./jobOpenings";
import { applicationRouter } from "./application";
import { userRouter } from "./user";
import { interviewRouter } from "./interview";
import { dashboardRouter } from "./dashboard";

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
