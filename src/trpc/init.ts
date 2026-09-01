import { initTRPC, TRPCError } from "@trpc/server";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== "MASTER_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Master admin access required",
    });
  }

  return next();
});

export const recruiterProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.session.user.role !== "RECRUITER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only recruiter can access this",
      });
    }

    return next();
  },
);

export const interviewerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.session.user.role !== "INTERVIEWER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only interviewer can access this",
      });
    }

    return next();
  },
);

export const createCallerFactory = t.createCallerFactory;
