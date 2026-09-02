import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { getNextStage } from "@/lib/application-stage";
import { ApplicationStage } from "@/generated/prisma/enums";

export async function advanceApplicationDomain(id: string) {
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

  const updated = await prisma.application.update({
    where: { id },
    data: {
      stage: nextStage,
    },
  });

  return updated;
}

export async function rejectApplicationDomain(id: string) {
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

  const updated = await prisma.application.update({
    where: { id },
    data: {
      stage: ApplicationStage.REJECTED,
      stageBeforeRejection: application.stage,
    },
  });

  return updated;
}

export async function reinstateApplicationDomain(id: string) {
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

  const updated = await prisma.application.update({
    where: { id },
    data: {
      stage: application.stageBeforeRejection,
      stageBeforeRejection: null,
    },
  });

  return updated;
}
