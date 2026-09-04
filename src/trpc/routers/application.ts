import { TRPCError } from "@trpc/server";
import { differenceInDays, format, subDays } from "date-fns";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import {
  ApplicationEventType,
  ApplicationStage,
  type Recommendation,
} from "@/generated/prisma/enums";
import { generateApplicationsCsv } from "@/lib/csv-exporter";
import { checkDuplicateCandidateEmail } from "@/lib/duplicate-detector";
import {
  advanceApplicationDomain,
  reinstateApplicationDomain,
  rejectApplicationDomain,
} from "@/lib/pipeline-service";
import {
  canAdvanceApplication,
  canAssignInterviewer,
  canEditApplication,
  canExportApplications,
  canReinstateApplication,
  canRejectApplication,
  canSubmitFeedback,
  canViewApplication,
} from "@/lib/policy";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, recruiterProcedure } from "@/trpc/init";

const createApplicationSchema = z.object({
  jobOpeningId: z.string().trim().min(1, "Job opening ID is required"),
  candidateName: z
    .string()
    .trim()
    .min(2, "Candidate name is required")
    .max(100),
  email: z.string().trim().email("Invalid candidate email address").max(100),
  source: z.string().trim().min(1, "Source is required").max(100),
  notes: z.string().max(2000).optional(),
});

const updateApplicationSchema = z.object({
  id: z.string().trim().min(1, "Application ID is required"),
  candidateName: z
    .string()
    .trim()
    .min(2, "Candidate name is required")
    .max(100),
  email: z.string().trim().email("Invalid candidate email address").max(100),
  source: z.string().trim().min(1, "Source is required").max(100),
  notes: z.string().max(2000).optional(),
});

const assignInterviewerSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  interviewerId: z.string().min(1, "Interviewer ID is required"),
});

const removeInterviewerSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  interviewerId: z.string().min(1, "Interviewer ID is required"),
});

const listApplicationsSchema = z.object({
  search: z.string().trim().optional(),
  jobOpeningId: z.string().optional(),
  stage: z
    .enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"])
    .optional(),
  source: z.string().optional(),
  sortBy: z.enum(["createdAt", "stage", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

const bulkActionSchema = z.object({
  applicationIds: z
    .array(z.string().min(1))
    .min(1, "At least one application must be selected")
    .max(100, "Maximum 100 applications per bulk action"),
});

const submitFeedbackSchema = z.object({
  applicationId: z.string().trim().min(1, "Application ID is required"),
  recommendation: z.enum(["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE"]),
  technicalRating: z.number().int().min(1).max(5).default(3),
  communicationRating: z.number().int().min(1).max(5).default(3),
  problemSolvingRating: z.number().int().min(1).max(5).default(3),
  comments: z
    .string()
    .trim()
    .min(3, "Please provide evaluation feedback comments")
    .max(2000),
});

export const applicationRouter = {
  checkDuplicateEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        excludeApplicationId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await checkDuplicateCandidateEmail(
        input.email,
        input.excludeApplicationId,
      );
    }),

  create: recruiterProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!canEditApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to create applications.",
        });
      }

      const jobOpening = await prisma.jobOpening.findUnique({
        where: { id: input.jobOpeningId },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      if (jobOpening.status === "ARCHIVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add candidates to an archived job opening.",
        });
      }

      const now = new Date();

      // TRANSACTIONAL CREATION: Create Application + CREATED ApplicationEvent
      const application = await prisma.$transaction(async (tx) => {
        const app = await tx.application.create({
          data: {
            jobOpeningId: input.jobOpeningId,
            candidateName: input.candidateName,
            email: input.email.trim().toLowerCase(),
            source: input.source,
            notes: input.notes ?? "",
            stage: ApplicationStage.APPLIED,
            stageChangedAt: now,
          },
        });

        await tx.applicationEvent.create({
          data: {
            applicationId: app.id,
            type: ApplicationEventType.CREATED,
            actorId: ctx.session.user.id,
            newStage: ApplicationStage.APPLIED,
          },
        });

        return app;
      });

      return application;
    }),

  update: recruiterProcedure
    .input(updateApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!canEditApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update applications.",
        });
      }

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
          email: input.email.trim().toLowerCase(),
          source: input.source,
          notes: input.notes ?? "",
        },
      });

      return application;
    }),

  advance: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input, ctx }) => {
      if (!canAdvanceApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to advance applications.",
        });
      }
      return await advanceApplicationDomain(
        input.id,
        ctx.session.user.id,
        ctx.session.user.role ?? undefined,
      );
    }),

  reject: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input, ctx }) => {
      if (!canRejectApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to reject applications.",
        });
      }
      return await rejectApplicationDomain(
        input.id,
        ctx.session.user.id,
        ctx.session.user.role ?? undefined,
      );
    }),

  reinstate: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ input, ctx }) => {
      if (!canReinstateApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to reinstate applications.",
        });
      }
      return await reinstateApplicationDomain(
        input.id,
        ctx.session.user.id,
        ctx.session.user.role ?? undefined,
      );
    }),

  bulkAdvance: recruiterProcedure
    .input(bulkActionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!canAdvanceApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to bulk advance applications.",
        });
      }

      const succeeded: Array<{
        applicationId: string;
        candidateName: string;
        oldStage: string;
        newStage: string;
      }> = [];

      const refused: Array<{
        applicationId: string;
        candidateName: string;
        reason: string;
      }> = [];

      for (const id of input.applicationIds) {
        try {
          const updated = await advanceApplicationDomain(
            id,
            ctx.session.user.id,
            ctx.session.user.role ?? undefined,
          );
          succeeded.push({
            applicationId: id,
            candidateName: updated.candidateName,
            oldStage: updated.stage,
            newStage: updated.stage,
          });
        } catch (err: unknown) {
          const application = await prisma.application.findUnique({
            where: { id },
          });
          refused.push({
            applicationId: id,
            candidateName: application?.candidateName || "Unknown Candidate",
            reason:
              err instanceof Error ? err.message : "Cannot advance candidate",
          });
        }
      }

      return { succeeded, refused };
    }),

  bulkReject: recruiterProcedure
    .input(bulkActionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!canRejectApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to bulk reject applications.",
        });
      }

      const succeeded: Array<{
        applicationId: string;
        candidateName: string;
        oldStage: string;
        newStage: string;
      }> = [];

      const refused: Array<{
        applicationId: string;
        candidateName: string;
        reason: string;
      }> = [];

      for (const id of input.applicationIds) {
        try {
          const updated = await rejectApplicationDomain(
            id,
            ctx.session.user.id,
            ctx.session.user.role ?? undefined,
          );
          succeeded.push({
            applicationId: id,
            candidateName: updated.candidateName,
            oldStage: updated.stageBeforeRejection || "PREVIOUS",
            newStage: ApplicationStage.REJECTED,
          });
        } catch (err: unknown) {
          const application = await prisma.application.findUnique({
            where: { id },
          });
          refused.push({
            applicationId: id,
            candidateName: application?.candidateName || "Unknown Candidate",
            reason:
              err instanceof Error ? err.message : "Cannot reject candidate",
          });
        }
      }

      return { succeeded, refused };
    }),

  submitFeedback: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
        include: {
          interviewers: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (!canSubmitFeedback(user, application)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You must be assigned to this application panel to submit feedback.",
        });
      }

      const feedback = await prisma.$transaction(async (tx) => {
        const fb = await tx.applicationFeedback.upsert({
          where: {
            applicationId_interviewerId: {
              applicationId: input.applicationId,
              interviewerId: user.id,
            },
          },
          create: {
            applicationId: input.applicationId,
            interviewerId: user.id,
            recommendation: input.recommendation as Recommendation,
            technicalRating: input.technicalRating,
            communicationRating: input.communicationRating,
            problemSolvingRating: input.problemSolvingRating,
            comments: input.comments,
          },
          update: {
            recommendation: input.recommendation as Recommendation,
            technicalRating: input.technicalRating,
            communicationRating: input.communicationRating,
            problemSolvingRating: input.problemSolvingRating,
            comments: input.comments,
          },
        });

        await tx.applicationEvent.create({
          data: {
            applicationId: input.applicationId,
            type: ApplicationEventType.FEEDBACK_ADDED,
            actorId: user.id,
            metadata: {
              recommendation: input.recommendation,
              technicalRating: input.technicalRating,
              communicationRating: input.communicationRating,
              problemSolvingRating: input.problemSolvingRating,
              comments: input.comments,
            },
          },
        });

        return fb;
      });

      return feedback;
    }),

  getFeedback: protectedProcedure
    .input(z.object({ applicationId: z.string().min(1) }))
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
          message:
            "You do not have permission to view feedback for this application.",
        });
      }

      const feedbacks = await prisma.applicationFeedback.findMany({
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
        orderBy: { createdAt: "desc" },
      });

      return feedbacks;
    }),

  getHistory: protectedProcedure
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
          message:
            "You do not have permission to view application history timeline.",
        });
      }

      const events = await prisma.applicationEvent.findMany({
        where: { applicationId: input.applicationId },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          interview: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return events;
    }),

  getStalledAlerts: recruiterProcedure.query(async ({ ctx }) => {
    if (!canAdvanceApplication(ctx.session.user)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to view stalled alerts.",
      });
    }

    const tenDaysAgo = subDays(new Date(), 10);
    const eligibleStages: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SCREENING,
      ApplicationStage.INTERVIEW,
      ApplicationStage.OFFER,
    ];

    // Query candidates in eligible active stages whose stageChangedAt is > 10 days ago
    const candidates = await prisma.application.findMany({
      where: {
        stage: { in: eligibleStages },
        stageChangedAt: { lt: tenDaysAgo },
      },
      include: {
        jobOpening: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
        dismissals: true,
      },
      orderBy: { stageChangedAt: "asc" },
    });

    const now = new Date();

    // Filter out candidates with a matching dismissal for the current stage & stageChangedAt
    const visibleAlerts = candidates
      .filter((app) => {
        const hasDismissal = app.dismissals.some(
          (d) =>
            d.stage === app.stage &&
            d.stageStartedAt.getTime() === app.stageChangedAt.getTime(),
        );
        return !hasDismissal;
      })
      .map((app) => ({
        applicationId: app.id,
        candidateName: app.candidateName,
        email: app.email,
        jobOpeningId: app.jobOpening.id,
        jobTitle: app.jobOpening.title,
        department: app.jobOpening.department,
        currentStage: app.stage,
        stageChangedAt: app.stageChangedAt,
        daysInStage: differenceInDays(now, app.stageChangedAt),
      }));

    return visibleAlerts;
  }),

  getStalledCount: recruiterProcedure.query(async ({ ctx }) => {
    if (!canAdvanceApplication(ctx.session.user)) {
      return { count: 0 };
    }

    const tenDaysAgo = subDays(new Date(), 10);
    const eligibleStages: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SCREENING,
      ApplicationStage.INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const candidates = await prisma.application.findMany({
      where: {
        stage: { in: eligibleStages },
        stageChangedAt: { lt: tenDaysAgo },
      },
      include: {
        dismissals: true,
      },
    });

    const count = candidates.filter((app) => {
      const hasDismissal = app.dismissals.some(
        (d) =>
          d.stage === app.stage &&
          d.stageStartedAt.getTime() === app.stageChangedAt.getTime(),
      );
      return !hasDismissal;
    }).length;

    return { count };
  }),

  dismissStalledAlert: recruiterProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!canAdvanceApplication(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to dismiss stalled alerts.",
        });
      }

      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const eligibleStages: ApplicationStage[] = [
        ApplicationStage.APPLIED,
        ApplicationStage.SCREENING,
        ApplicationStage.INTERVIEW,
        ApplicationStage.OFFER,
      ];

      if (!eligibleStages.includes(application.stage as ApplicationStage)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Only applications in active pipeline stages can be dismissed.",
        });
      }

      const tenDaysAgo = subDays(new Date(), 10);
      if (application.stageChangedAt >= tenDaysAgo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This application is not currently stalled.",
        });
      }

      const dismissal = await prisma.stalledApplicationDismissal.upsert({
        where: {
          applicationId_stage_stageStartedAt: {
            applicationId: application.id,
            stage: application.stage,
            stageStartedAt: application.stageChangedAt,
          },
        },
        create: {
          applicationId: application.id,
          stage: application.stage,
          stageStartedAt: application.stageChangedAt,
          dismissedById: ctx.session.user.id,
        },
        update: {},
      });

      return dismissal;
    }),

  exportCsv: protectedProcedure.query(async ({ ctx }) => {
    if (!canExportApplications(ctx.session.user)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to export pipeline CSV data.",
      });
    }

    const user = ctx.session.user;
    const where: Prisma.ApplicationWhereInput = {
      jobOpening: {
        status: "OPEN",
      },
    };

    if (user.role === "INTERVIEWER") {
      where.interviewers = {
        some: {
          interviewerId: user.id,
        },
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        jobOpening: {
          select: {
            title: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const csvContent = generateApplicationsCsv(applications);
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const filename = `pipeline-export-${dateStr}.csv`;

    return {
      filename,
      csvContent,
      count: applications.length,
    };
  }),

  assignInterviewer: recruiterProcedure
    .input(assignInterviewerSchema)
    .mutation(async ({ input, ctx }) => {
      if (!canAssignInterviewer(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to assign interviewers.",
        });
      }

      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (application.stage === ApplicationStage.APPLIED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Interviewer assignment is not available while candidate is in the Applied stage. Move candidate to Screening or Interview first.",
        });
      }

      if (
        application.stage === ApplicationStage.REJECTED ||
        application.stage === ApplicationStage.HIRED
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot assign interviewers to an application that is ${application.stage.toLowerCase()}.`,
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

      if (!targetUser.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot assign an inactive or deactivated interviewer.",
        });
      }

      if (targetUser.role !== "INTERVIEWER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Only users with the INTERVIEWER role can be assigned to an application panel.",
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
    .mutation(async ({ input, ctx }) => {
      if (!canAssignInterviewer(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to remove interviewers.",
        });
      }

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
          message:
            "You do not have permission to view panel members for this application.",
        });
      }

      const assignments = await prisma.applicationInterviewer.findMany({
        where: { applicationId: input.applicationId },
        include: {
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return assignments.map((a) => ({
        ...a.interviewer,
        assignedAt: a.createdAt,
      }));
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

  getSources: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const where: Prisma.ApplicationWhereInput = {};

    if (user.role === "INTERVIEWER") {
      where.interviewers = {
        some: {
          interviewerId: user.id,
        },
      };
    }

    const result = await prisma.application.findMany({
      where,
      distinct: ["source"],
      select: {
        source: true,
      },
      orderBy: {
        source: "asc",
      },
    });

    return result.map((r) => r.source).filter(Boolean);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
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
                  role: true,
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

      if (!canViewApplication(user, application)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to view this candidate application.",
        });
      }

      return application;
    }),

  getByJobOpeningId: recruiterProcedure
    .input(z.object({ jobOpeningId: z.string().min(1) }))
    .query(async ({ input }) => {
      const applications = await prisma.application.findMany({
        where: { jobOpeningId: input.jobOpeningId },
        orderBy: { createdAt: "desc" },
      });
      return applications;
    }),

  list: protectedProcedure
    .input(listApplicationsSchema)
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const where: Prisma.ApplicationWhereInput = {};

      if (user.role === "INTERVIEWER") {
        where.interviewers = {
          some: {
            interviewerId: user.id,
          },
        };
      }

      if (input.jobOpeningId) {
        where.jobOpeningId = input.jobOpeningId;
      }

      // Stage filtering behavior:
      // If input.stage is explicitly provided, filter by that stage (e.g. REJECTED, HIRED, INTERVIEW, etc.)
      // If input.stage is NOT provided (default Active Candidates view), show ONLY active pipeline stages:
      // APPLIED, SCREENING, INTERVIEW, OFFER — NOT HIRED or REJECTED (those are terminal outcomes)
      if (input.stage) {
        where.stage = input.stage as ApplicationStage;
      } else {
        where.stage = {
          in: [
            ApplicationStage.APPLIED,
            ApplicationStage.SCREENING,
            ApplicationStage.INTERVIEW,
            ApplicationStage.OFFER,
          ],
        };
      }

      if (input.source) {
        where.source = input.source;
      }

      if (input.search && input.search.length > 0) {
        where.AND = [
          {
            OR: [
              {
                candidateName: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        ];
      }

      const orderBy: Prisma.ApplicationOrderByWithRelationInput = {
        [input.sortBy]: input.sortOrder,
      };

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const [items, total] = await prisma.$transaction([
        prisma.application.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            jobOpening: {
              select: {
                id: true,
                title: true,
                department: true,
                status: true,
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
        }),
        prisma.application.count({
          where,
        }),
      ]);

      return {
        items,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),
};
