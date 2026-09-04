import { ApplicationStage } from "@/generated/prisma/enums";

export const PIPELINE_ORDER: ApplicationStage[] = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED,
];

/**
 * Calculates the next stage in the pipeline.
 * Returns null if the stage cannot be advanced further (HIRED or REJECTED).
 */
export function getNextStage(
  currentStage: ApplicationStage,
): ApplicationStage | null {
  switch (currentStage) {
    case ApplicationStage.APPLIED:
      return ApplicationStage.SCREENING;
    case ApplicationStage.SCREENING:
      return ApplicationStage.INTERVIEW;
    case ApplicationStage.INTERVIEW:
      return ApplicationStage.OFFER;
    case ApplicationStage.OFFER:
      return ApplicationStage.HIRED;
    case ApplicationStage.HIRED:
    case ApplicationStage.REJECTED:
      return null;
    default:
      return null;
  }
}

/**
 * Checks if an application can be advanced further.
 */
export function canAdvance(currentStage: ApplicationStage): boolean {
  return getNextStage(currentStage) !== null;
}

/**
 * Checks if an application can be rejected.
 * Rejection is allowed from any active pipeline stage.
 * REJECTED (already rejected) and HIRED (terminal outcome) cannot be rejected again.
 */
export function canReject(currentStage: ApplicationStage): boolean {
  return (
    currentStage !== ApplicationStage.REJECTED &&
    currentStage !== ApplicationStage.HIRED
  );
}

/**
 * Checks if an application can be reinstated.
 * Reinstatement is only allowed for REJECTED applications.
 */
export function canReinstate(currentStage: ApplicationStage): boolean {
  return currentStage === ApplicationStage.REJECTED;
}
