import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recruiterProcedure } from "@/trpc/init";
import { getNextStage } from "@/lib/application-stage";
import { ApplicationStage } from "@/generated/prisma/enums";

const createApplicationSchema = z.object({
  jobOpeningId: z.string().min(1, "Job opening ID is required"),
  candidateName: z.string().min(2, "Candidate name is required"),
  email: z.string().email("Invalid candidate email address"),
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

const updateApplicationSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  candidateName: z.string().min(2, "Candidate name is required"),
  email: z.string().email("Invalid candidate email address"),
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

export const applicationRouter = {
  create: recruiterProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.findUnique({
        where: { id: input.jobOpeningId },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      const application = await prisma.application.create({
        data: {
          jobOpeningId: input.jobOpeningId,
          candidateName: input.candidateName,
          email: input.email,
          source: input.source,
          notes: input.notes ?? "",
          stage: ApplicationStage.APPLIED,
        },
      });

      return application;
    }),

  update: recruiterProcedure
    .input(updateApplicationSchema)
    .mutation(async ({ input }) => {
      const existing = await prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const application = await prisma.application.update({
        where: { id: input.id },
        data: {
          candidateName: input.candidateName,
          email: input.email,
          source: input.source,
          notes: input.notes ?? "",
        },
      });

      return application;
    }),

  advance: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const nextStage = getNextStage(application.stage as ApplicationStage);

      if (!nextStage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Application cannot be advanced from ${application.stage}.`,
        });
      }

      const updated = await prisma.application.update({
        where: { id: input.id },
        data: {
          stage: nextStage,
        },
      });

      return updated;
    }),

  reject: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (application.stage === ApplicationStage.REJECTED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Application is already rejected.",
        });
      }

      const updated = await prisma.application.update({
        where: { id: input.id },
        data: {
          stage: ApplicationStage.REJECTED,
          stageBeforeRejection: application.stage,
        },
      });

      return updated;
    }),

  reinstate: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (
        application.stage !== ApplicationStage.REJECTED ||
        !application.stageBeforeRejection
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only rejected applications can be reinstated.",
        });
      }

      const updated = await prisma.application.update({
        where: { id: input.id },
        data: {
          stage: application.stageBeforeRejection,
          stageBeforeRejection: null,
        },
      });

      return updated;
    }),

  getByJobOpeningId: recruiterProcedure
    .input(
      z.object({
        jobOpeningId: z.string().min(1, "Job opening ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const applications = await prisma.application.findMany({
        where: { jobOpeningId: input.jobOpeningId },
        orderBy: { createdAt: "desc" },
      });

      return applications;
    }),

  getById: recruiterProcedure
    .input(
      z.object({
        id: z.string().min(1, "Application ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          jobOpening: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return application;
    }),
};
