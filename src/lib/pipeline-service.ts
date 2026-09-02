import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { getNextStage } from "@/lib/application-stage";
import { ApplicationStage, InterviewStatus } from "@/generated/prisma/enums";
import { logAuditEvent } from "@/lib/logger";

export async function advanceApplicationDomain(id: string, userId?: string, userRole?: string) {
  const application = await prisma.application.findUnique({
    where: { id },
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
      message: "Rejected applications cannot be advanced.",
    });
  }

  if (application.stage === ApplicationStage.HIRED) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Application is already at the HIRED stage.",
    });
  }

  const nextStage = getNextStage(application.stage as ApplicationStage);

  if (!nextStage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot advance application directly from ${application.stage}. Applications must move one stage at a time.`,
    });
  }

  // BUSINESS RULE: INTERVIEW -> OFFER requires at least 1 COMPLETED interview
  if (application.stage === ApplicationStage.INTERVIEW && nextStage === ApplicationStage.OFFER) {
    const completedCount = await prisma.interview.count({
      where: {
        applicationId: id,
        status: InterviewStatus.COMPLETED,
      },
    });

    if (completedCount === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "At least one completed interview is required before moving candidate to OFFER stage.",
      });
    }
  }

  // ATOMIC CONDITIONAL UPDATE: Guarantees concurrency safety if another user updated stage simultaneously
  const result = await prisma.application.updateMany({
    where: {
      id,
      stage: application.stage,
    },
    data: {
      stage: nextStage,
      ...(nextStage === ApplicationStage.HIRED ? { hiredAt: new Date() } : {}),
    },
  });

  if (result.count === 0) {
    logAuditEvent({
      action: "STAGE_ADVANCE",
      userId,
      userRole,
      entityId: id,
      status: "FAILURE",
      errorMessage: "Concurrent update conflict",
    });
    throw new TRPCError({
      code: "CONFLICT",
      message: "This application was modified by another user concurrently. Please refresh.",
    });
  }

  const updated = await prisma.application.findUnique({
    where: { id },
  });

  logAuditEvent({
    action: "STAGE_ADVANCE",
    userId,
    userRole,
    entityId: id,
    metadata: {
      oldStage: application.stage,
      newStage: nextStage,
    },
  });

  return updated!;
}

export async function rejectApplicationDomain(id: string, userId?: string, userRole?: string) {
  const application = await prisma.application.findUnique({
    where: { id },
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

  // ATOMIC CONDITIONAL UPDATE for concurrency safety
  const result = await prisma.application.updateMany({
    where: {
      id,
      stage: application.stage,
    },
    data: {
      stage: ApplicationStage.REJECTED,
      stageBeforeRejection: application.stage,
    },
  });

  if (result.count === 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This application was modified by another user concurrently. Please refresh.",
    });
  }

  const updated = await prisma.application.findUnique({
    where: { id },
  });

  logAuditEvent({
    action: "STAGE_REJECT",
    userId,
    userRole,
    entityId: id,
    metadata: {
      oldStage: application.stage,
      newStage: ApplicationStage.REJECTED,
    },
  });

  return updated!;
}

export async function reinstateApplicationDomain(id: string, userId?: string, userRole?: string) {
  const application = await prisma.application.findUnique({
    where: { id },
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

  const targetStage = application.stageBeforeRejection;

  // ATOMIC CONDITIONAL UPDATE
  const result = await prisma.application.updateMany({
    where: {
      id,
      stage: ApplicationStage.REJECTED,
    },
    data: {
      stage: targetStage,
      stageBeforeRejection: null,
    },
  });

  if (result.count === 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This application was modified by another user concurrently. Please refresh.",
    });
  }

  const updated = await prisma.application.findUnique({
    where: { id },
  });

  logAuditEvent({
    action: "STAGE_REINSTATE",
    userId,
    userRole,
    entityId: id,
    metadata: {
      oldStage: ApplicationStage.REJECTED,
      newStage: targetStage,
    },
  });

  return updated!;
}
