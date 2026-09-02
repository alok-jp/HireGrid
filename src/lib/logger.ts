export type AuditAction =
  | "STAGE_ADVANCE"
  | "STAGE_REJECT"
  | "STAGE_REINSTATE"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_CANCELLED"
  | "INTERVIEW_COMPLETED"
  | "INTERVIEWER_ASSIGNED"
  | "INTERVIEWER_REMOVED"
  | "FEEDBACK_SUBMITTED"
  | "BULK_ACTION"
  | "CSV_EXPORT"
  | "AUTH_EVENT";

export interface AuditLogOptions {
  action: AuditAction;
  userId?: string | null;
  userRole?: string | null;
  entityId?: string;
  entityType?: "APPLICATION" | "INTERVIEW" | "JOB_OPENING" | "USER";
  metadata?: Record<string, any>;
  status?: "SUCCESS" | "FAILURE";
  errorMessage?: string;
}

export function logAuditEvent(options: AuditLogOptions) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action: options.action,
    userId: options.userId ?? "SYSTEM",
    userRole: options.userRole ?? "UNKNOWN",
    entityType: options.entityType ?? "APPLICATION",
    entityId: options.entityId ?? "N/A",
    status: options.status ?? "SUCCESS",
    ...(options.metadata ? { metadata: options.metadata } : {}),
    ...(options.errorMessage ? { error: options.errorMessage } : {}),
  };

  if (process.env.NODE_ENV !== "test") {
    console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
  }

  return logEntry;
}
