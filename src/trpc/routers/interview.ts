import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recruiterProcedure, protectedProcedure } from "@/trpc/init";
import { InterviewStatus, ApplicationEventType } from "@/generated/prisma/enums";
import { canViewApplication } from "@/lib/policy";
import { format } from "date-fns";
import { logAuditEvent } from "@/lib/logger";

const createInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  scheduledAt: z.string().datetime({ message: "Invalid date and time format" }),
  duration: z.number().int().min(15).max(480).default(60),
  interviewerIds: z
    .array(z.string().min(1))
    .min(1, "At least one interviewer must be assigned to the interview")
    .max(10, "Maximum 10 interviewers per interview"),
});

const updateInterviewSchema = z.object({
  id: z.string().min(1, "Interview ID is required"),
  scheduledAt: z.string().datetime({ message: "Invalid date and time format" }),
  duration: z.number().int().min(15).max(480).default(60),
  interviewerIds: z
    .array(z.string().min(1))
    .min(1, "At least one interviewer must be assigned to the interview")
    .max(10, "Maximum 10 interviewers per interview"),
});

async function checkDoubleBookingCollision(
  uniqueInterviewerIds: string[],
  proposedStart: Date,
  durationMinutes: number,
  excludeInterviewId?: string,
) {
  const proposedEnd = new Date(proposedStart.getTime() + durationMinutes * 60 * 1000);

  const existingScheduled = await prisma.interview.findMany({
    where: {
      status: InterviewStatus.SCHEDULED,
      ...(excludeInterviewId ? { id: { not: excludeInterviewId } } : {}),
      interviewers: {
        some: {
          interviewerId: { in: uniqueInterviewerIds },
        },
      },
    },
    include: {
      interviewers: {
        include: {
          interviewer: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  for (const interview of existingScheduled) {
    const existStart = new Date(interview.scheduledAt);
    const existEnd = new Date(
      existStart.getTime() + (interview.duration ?? 60) * 60 * 1000,
    );

    if (existStart < proposedEnd && existEnd > proposedStart) {
      const conflicting = interview.interviewers.find((i) =>
        uniqueInterviewerIds.includes(i.interviewerId),
      );
      const name = conflicting?.interviewer.name || "Selected interviewer";
      const formattedTimeWindow = `${format(existStart, "h:mm a")} - ${format(existEnd, "h:mm a")}`;

      throw new TRPCError({
        code: "CONFLICT",
        message: `Interviewer ${name} is already scheduled for another interview during this time (${formattedTimeWindow}).`,
      });
    }
  }
}

export const interviewRouter = {
  create: recruiterProcedure
    .input(createInterviewSchema)
    .mutation(async ({ input, ctx }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const uniqueInterviewerIds = Array.from(new Set(input.interviewerIds));

      const interviewers = await prisma.user.findMany({
        where: {
          id: { in: uniqueInterviewerIds },
        },
        select: { id: true, role: true, name: true },
      });

      if (interviewers.length !== uniqueInterviewerIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more selected interviewers could not be found.",
        });
      }

      const scheduledDate = new Date(input.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid scheduled date and time.",
        });
      }

      await checkDoubleBookingCollision(
        uniqueInterviewerIds,
        scheduledDate,
        input.duration,
      );

      const interview = await prisma.$transaction(async (tx) => {
        const inv = await tx.interview.create({
          data: {
            applicationId: input.applicationId,
            scheduledAt: scheduledDate,
            duration: input.duration,
            status: InterviewStatus.SCHEDULED,
            interviewers: {
              createMany: {
                data: uniqueInterviewerIds.map((interviewerId) => ({
                  interviewerId,
                })),
              },
            },
          },
          include: {
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

        await tx.applicationEvent.create({
          data: {
            applicationId: input.applicationId,
            type: ApplicationEventType.INTERVIEW_SCHEDULED,
            actorId: ctx.session.user.id,
            interviewId: inv.id,
            metadata: {
              scheduledAt: scheduledDate.toISOString(),
              duration: input.duration,
            },
          },
        });

        return inv;
      });

      logAuditEvent({
        action: "INTERVIEW_SCHEDULED",
        userId: ctx.session.user.id,
        userRole: ctx.session.user.role,
        entityId: interview.id,
        entityType: "INTERVIEW",
        metadata: {
          applicationId: input.applicationId,
          scheduledAt: scheduledDate.toISOString(),
          duration: input.duration,
          interviewersCount: uniqueInterviewerIds.length,
        },
      });

      return interview;
    }),

  update: recruiterProcedure
    .input(updateInterviewSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.interview.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      const uniqueInterviewerIds = Array.from(new Set(input.interviewerIds));

      const interviewers = await prisma.user.findMany({
        where: {
          id: { in: uniqueInterviewerIds },
        },
        select: { id: true, role: true, name: true },
      });

      if (interviewers.length !== uniqueInterviewerIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more selected interviewers could not be found.",
        });
      }

      const scheduledDate = new Date(input.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid scheduled date and time.",
        });
      }

      await checkDoubleBookingCollision(
        uniqueInterviewerIds,
        scheduledDate,
        input.duration,
        input.id,
      );

      await prisma.$transaction(async (tx) => {
        await tx.interviewInterviewer.deleteMany({
          where: { interviewId: input.id },
        });

        await tx.interview.update({
          where: { id: input.id },
          data: {
            scheduledAt: scheduledDate,
            duration: input.duration,
            interviewers: {
              createMany: {
                data: uniqueInterviewerIds.map((interviewerId) => ({
                  interviewerId,
                })),
              },
            },
          },
        });

        await tx.applicationEvent.create({
          data: {
            applicationId: existing.applicationId,
            type: ApplicationEventType.INTERVIEW_RESCHEDULED,
            actorId: ctx.session.user.id,
            interviewId: input.id,
            metadata: {
              previousScheduledAt: existing.scheduledAt.toISOString(),
              newScheduledAt: scheduledDate.toISOString(),
              duration: input.duration,
            },
          },
        });
      });

      const updated = await prisma.interview.findUnique({
        where: { id: input.id },
        include: {
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

      logAuditEvent({
        action: "INTERVIEW_RESCHEDULED",
        userId: ctx.session.user.id,
        userRole: ctx.session.user.role,
        entityId: input.id,
        entityType: "INTERVIEW",
        metadata: {
          scheduledAt: scheduledDate.toISOString(),
          duration: input.duration,
        },
      });

      return updated;
    }),

  cancel: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Interview ID is required") }))
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.interview.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      const cancelled = await prisma.$transaction(async (tx) => {
        const inv = await tx.interview.update({
          where: { id: input.id },
          data: {
            status: InterviewStatus.CANCELLED,
          },
        });

        await tx.applicationEvent.create({
          data: {
            applicationId: existing.applicationId,
            type: ApplicationEventType.INTERVIEW_CANCELLED,
            actorId: ctx.session.user.id,
            interviewId: input.id,
          },
        });

        return inv;
      });

      logAuditEvent({
        action: "INTERVIEW_CANCELLED",
        userId: ctx.session.user.id,
        userRole: ctx.session.user.role,
        entityId: input.id,
        entityType: "INTERVIEW",
      });

      return cancelled;
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().min(1, "Interview ID is required") }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const existing = await prisma.interview.findUnique({
        where: { id: input.id },
        include: {
          interviewers: true,
          application: {
            include: {
              interviewers: true,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      const isAssignedToInterview = existing.interviewers.some(
        (i) => i.interviewerId === user.id,
      );
      const isAssignedToApplication = existing.application.interviewers.some(
        (i) => i.interviewerId === user.id,
      );

      if (
        user.role !== "RECRUITER" &&
        user.role !== "MASTER_ADMIN" &&
        !isAssignedToInterview &&
        !isAssignedToApplication
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not assigned to this interview.",
        });
      }

      const completed = await prisma.interview.update({
        where: { id: input.id },
        data: {
          status: InterviewStatus.COMPLETED,
        },
      });

      logAuditEvent({
        action: "INTERVIEW_COMPLETED",
        userId: user.id,
        userRole: user.role,
        entityId: input.id,
        entityType: "INTERVIEW",
      });

      return completed;
    }),

  listForApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { interviewers: true },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (!canViewApplication(user, application)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view interviews for this application.",
        });
      }

      const interviews = await prisma.interview.findMany({
        where: { applicationId: input.applicationId },
        include: {
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
        orderBy: { scheduledAt: "desc" },
      });

      return interviews;
    }),

  listUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const now = new Date();

    const where: any = {
      status: InterviewStatus.SCHEDULED,
      scheduledAt: { gte: now },
    };

    if (user.role === "INTERVIEWER") {
      where.interviewers = {
        some: {
          interviewerId: user.id,
        },
      };
    }

    const upcoming = await prisma.interview.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            candidateName: true,
            email: true,
            stage: true,
            jobOpening: {
              select: {
                id: true,
                title: true,
                department: true,
              },
            },
          },
        },
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
      orderBy: { scheduledAt: "asc" },
      take: 10,
    });

    return upcoming;
  }),
};
