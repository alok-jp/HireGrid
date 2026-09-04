import { TRPCError } from "@trpc/server";
import {
  ApplicationEventType,
  ApplicationStage,
  InterviewStatus,
} from "@/generated/prisma/enums";
import { getNextStage } from "@/lib/application-stage";
import { logAuditEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function advanceApplicationDomain(
  id: string,
  userId: string,
  userRole?: string,
) {
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
      message:
        "Application is already at the HIRED stage and cannot be advanced further.",
    });
  }

  const oldStage = application.stage as ApplicationStage;
  const nextStage = getNextStage(oldStage);

  if (!nextStage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot advance application directly from ${oldStage}. Applications must move one stage at a time.`,
    });
  }

  // BUSINESS RULE: INTERVIEW -> OFFER requires at least 1 COMPLETED interview
  if (
    oldStage === ApplicationStage.INTERVIEW &&
    nextStage === ApplicationStage.OFFER
  ) {
    const completedCount = await prisma.interview.count({
      where: {
        applicationId: id,
        status: InterviewStatus.COMPLETED,
      },
    });

    if (completedCount === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "At least one completed interview is required before moving candidate to OFFER stage.",
      });
    }
  }

  const now = new Date();

  // TRANSACTIONAL ATOMIC CONDITIONAL UPDATE + EVENT CREATION + HIRED_AT SETTING
  const updated = await prisma.$transaction(
    async (tx) => {
      const result = await tx.application.updateMany({
        where: {
          id,
          stage: oldStage,
        },
        data: {
          stage: nextStage,
          stageChangedAt: now,
          ...(nextStage === ApplicationStage.HIRED
            ? { hiredAt: application.hiredAt ?? now }
            : {}),
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This application was modified by another user concurrently. Please refresh.",
        });
      }

      await tx.applicationEvent.create({
        data: {
          applicationId: id,
          type: ApplicationEventType.STAGE_CHANGED,
          actorId: userId,
          oldStage,
          newStage: nextStage,
        },
      });

      return await tx.application.findUnique({
        where: { id },
      });
    },
    { timeout: 20000 },
  );

  if (!updated) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found after update.",
    });
  }

  logAuditEvent({
    action: "STAGE_ADVANCE",
    userId,
    userRole,
    entityId: id,
    metadata: {
      oldStage,
      newStage: nextStage,
    },
  });

  return updated;
}

export async function rejectApplicationDomain(
  id: string,
  userId: string,
  userRole?: string,
) {
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

  if (application.stage === ApplicationStage.HIRED) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Hired candidates cannot be rejected. HIRED is a terminal outcome.",
    });
  }

  const oldStage = application.stage as ApplicationStage;
  const now = new Date();

  // TRANSACTIONAL ATOMIC CONDITIONAL UPDATE + EVENT CREATION + STAGE_CHANGED_AT RESET
  const updated = await prisma.$transaction(
    async (tx) => {
      const result = await tx.application.updateMany({
        where: {
          id,
          stage: oldStage,
        },
        data: {
          stage: ApplicationStage.REJECTED,
          stageBeforeRejection: oldStage,
          stageChangedAt: now,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This application was modified by another user concurrently. Please refresh.",
        });
      }

      await tx.applicationEvent.create({
        data: {
          applicationId: id,
          type: ApplicationEventType.REJECTED,
          actorId: userId,
          oldStage,
          newStage: ApplicationStage.REJECTED,
        },
      });

      return await tx.application.findUnique({
        where: { id },
      });
    },
    { timeout: 20000 },
  );

  if (!updated) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found after update.",
    });
  }

  logAuditEvent({
    action: "STAGE_REJECT",
    userId,
    userRole,
    entityId: id,
    metadata: {
      oldStage,
      newStage: ApplicationStage.REJECTED,
    },
  });

  return updated;
}

export async function reinstateApplicationDomain(
  id: string,
  userId: string,
  userRole?: string,
) {
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

  const targetStage = application.stageBeforeRejection as ApplicationStage;
  const now = new Date();

  // TRANSACTIONAL ATOMIC CONDITIONAL UPDATE + EVENT CREATION + STAGE_CHANGED_AT RESET
  const updated = await prisma.$transaction(
    async (tx) => {
      const result = await tx.application.updateMany({
        where: {
          id,
          stage: ApplicationStage.REJECTED,
        },
        data: {
          stage: targetStage,
          stageBeforeRejection: null,
          stageChangedAt: now,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This application was modified by another user concurrently. Please refresh.",
        });
      }

      await tx.applicationEvent.create({
        data: {
          applicationId: id,
          type: ApplicationEventType.REINSTATED,
          actorId: userId,
          oldStage: ApplicationStage.REJECTED,
          newStage: targetStage,
        },
      });

      return await tx.application.findUnique({
        where: { id },
      });
    },
    { timeout: 20000 },
  );

  if (!updated) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found after update.",
    });
  }

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

  return updated;
}
