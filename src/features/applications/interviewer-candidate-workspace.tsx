"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { ApplicationStageTracker } from "@/features/applications/application-stage";
import { InterviewFeedback } from "@/features/applications/interview-feedback";
import { InterviewSection } from "@/features/interviews/interview-section";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Mail,
  FileText,
  UserCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ApplicationStage } from "@/generated/prisma/enums";

interface InterviewerCandidateWorkspaceProps {
  applicationId: string;
}

export function InterviewerCandidateWorkspace({
  applicationId,
}: InterviewerCandidateWorkspaceProps) {
  const { data: application, isLoading } = trpc.application.getById.useQuery({
    id: applicationId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <div className="skeleton w-36 h-8" />
        <div className="skeleton w-full h-48" />
        <div className="skeleton w-full h-64" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-12 text-center">
        <p className="text-body font-semibold">Candidate application not found or not assigned to you.</p>
        <Link href="/interviewer" className="text-xs text-[var(--accent)] hover:underline mt-2 inline-block">
          Return to My Assigned Applications
        </Link>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(application.createdAt), {
    addSuffix: true,
  });
  const exactDate = format(new Date(application.createdAt), "MMMM d, yyyy 'at' h:mm a");

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/interviewer"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Assigned Applications
        </Link>

        <span className="px-2.5 py-1 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Interviewer Evaluation Portal</span>
        </span>
      </div>

      {/* Main Candidate Card */}
      <div className="p-6 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            <h1 className="text-display text-[var(--text-primary)]">
              {application.candidateName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span>{application.email}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-sm bg-[var(--surface-2)] font-semibold text-[11px]">
                Source: {application.source}
              </span>
            </div>
          </div>

          <div className="flex flex-col text-left sm:text-right text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1 sm:justify-end text-[var(--accent)] font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{application.jobOpening.title}</span>
            </div>
            <div className="flex items-center gap-1 sm:justify-end mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{application.jobOpening.department}</span>
            </div>
            <div className="flex items-center gap-1 sm:justify-end mt-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span title={exactDate}>Applied {timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Notes Section if Present */}
        {application.notes && (
          <div className="space-y-1 bg-[var(--surface-1)] p-4 rounded-md border border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
              Recruiter Notes & Candidate Details
            </span>
            <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line leading-relaxed pt-1">
              {application.notes}
            </p>
          </div>
        )}

        {/* Stage Progress Tracker */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
            Pipeline Progression
          </span>
          <ApplicationStageTracker
            stage={application.stage as ApplicationStage}
            stageBeforeRejection={application.stageBeforeRejection as ApplicationStage | null}
          />
        </div>
      </div>

      {/* Scheduled Interviews Section with Mark Completed */}
      <InterviewSection applicationId={application.id} isRecruiter={false} />

      {/* Structured Interview Feedback */}
      <InterviewFeedback applicationId={application.id} />
    </div>
  );
}
