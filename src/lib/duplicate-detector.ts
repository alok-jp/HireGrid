import { prisma } from "@/lib/prisma";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  message?: string;
  existingApplication?: {
    id: string;
    candidateName: string;
    email: string;
    stage: string;
    jobTitle: string;
  };
}

export async function checkDuplicateCandidateEmail(
  email: string,
  excludeApplicationId?: string,
): Promise<DuplicateCheckResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.application.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
      ...(excludeApplicationId
        ? {
            id: {
              not: excludeApplicationId,
            },
          }
        : {}),
    },
    include: {
      jobOpening: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!existing) {
    return { isDuplicate: false };
  }

  return {
    isDuplicate: true,
    message: `An active application already exists for ${existing.email} (${existing.candidateName} for position "${existing.jobOpening.title}" in ${existing.stage} stage).`,
    existingApplication: {
      id: existing.id,
      candidateName: existing.candidateName,
      email: existing.email,
      stage: existing.stage,
      jobTitle: existing.jobOpening.title,
    },
  };
}
