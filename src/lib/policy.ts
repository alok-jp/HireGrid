export interface UserSessionPayload {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface ApplicationAccessPayload {
  id: string;
  jobOpeningId?: string;
  interviewers?: Array<{ interviewerId: string }>;
}

/**
 * Centralized Server Authorization Policy Rules:
 * - RECRUITER & MASTER_ADMIN: Full access to edit, advance, reject, reinstate, assign interviewers, and export.
 * - INTERVIEWER: Strictly limited to viewing and submitting feedback on assigned applications.
 *   Forbidden from advancing/rejecting/reinstating candidates, editing applications, or managing panel assignments.
 */

export function canViewApplication(
  user: UserSessionPayload,
  application: ApplicationAccessPayload,
): boolean {
  if (user.role === "RECRUITER" || user.role === "MASTER_ADMIN") {
    return true;
  }
  if (user.role === "INTERVIEWER") {
    if (!application.interviewers) return false;
    return application.interviewers.some((i) => i.interviewerId === user.id);
  }
  return false;
}

export function canEditApplication(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canAdvanceApplication(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canRejectApplication(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canReinstateApplication(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canAssignInterviewer(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canExportApplications(user: UserSessionPayload): boolean {
  return user.role === "RECRUITER" || user.role === "MASTER_ADMIN";
}

export function canSubmitFeedback(
  user: UserSessionPayload,
  application: ApplicationAccessPayload,
): boolean {
  if (user.role === "INTERVIEWER") {
    if (!application.interviewers) return false;
    return application.interviewers.some((i) => i.interviewerId === user.id);
  }
  if (user.role === "RECRUITER" || user.role === "MASTER_ADMIN") {
    return true;
  }
  return false;
}
