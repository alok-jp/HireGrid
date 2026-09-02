import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recruiterProcedure, protectedProcedure } from "@/trpc/init";
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

const assignInterviewerSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  interviewerId: z.string().min(1, "Interviewer ID is required"),
});

const removeInterviewerSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  interviewerId: z.string().min(1, "Interviewer ID is required"),
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

  getAssignableInterviewers: recruiterProcedure.query(async () => {
    const interviewers = await prisma.user.findMany({
      where: { role: "INTERVIEWER" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return interviewers;
  }),

  assignInterviewer: recruiterProcedure
    .input(assignInterviewerSchema)
    .mutation(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: input.interviewerId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target user not found",
        });
      }

      if (targetUser.role !== "INTERVIEWER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only users with the INTERVIEWER role can be assigned to an application.",
        });
      }

      const assignment = await prisma.applicationInterviewer.upsert({
        where: {
          applicationId_interviewerId: {
            applicationId: input.applicationId,
            interviewerId: input.interviewerId,
          },
        },
        create: {
          applicationId: input.applicationId,
          interviewerId: input.interviewerId,
        },
        update: {},
      });

      return assignment;
    }),

  removeInterviewer: recruiterProcedure
    .input(removeInterviewerSchema)
    .mutation(async ({ input }) => {
      try {
        await prisma.applicationInterviewer.delete({
          where: {
            applicationId_interviewerId: {
              applicationId: input.applicationId,
              interviewerId: input.interviewerId,
            },
          },
        });
      } catch {
        // Handle gracefully if record already removed
      }

      return { success: true };
    }),

  getInterviewers: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const assignments = await prisma.applicationInterviewer.findMany({
        where: { applicationId: input.applicationId },
        include: {
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return assignments.map((a) => a.interviewer);
    }),

  myAssigned: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const applications = await prisma.application.findMany({
      where: {
        interviewers: {
          some: {
            interviewerId: userId,
          },
        },
      },
      include: {
        jobOpening: {
          select: {
            id: true,
            title: true,
            department: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
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

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Application ID is required"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          jobOpening: true,
          interviewers: {
            include: {
              interviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (user.role === "INTERVIEWER") {
        const isAssigned = application.interviewers.some(
          (i) => i.interviewerId === user.id,
        );

        if (!isAssigned) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not assigned to this application.",
          });
        }
      }

      return application;
    }),
};
