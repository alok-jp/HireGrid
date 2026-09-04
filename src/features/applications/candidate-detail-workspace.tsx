"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Edit,
  FileText,
  Mail,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationActions } from "@/features/applications/application-actions";
import { ApplicationStageTracker } from "@/features/applications/application-stage";
import { ApplicationTimeline } from "@/features/applications/application-timeline";
import { InterviewFeedback } from "@/features/applications/interview-feedback";
import { InterviewPanel } from "@/features/applications/interview-panel";
import { InterviewSection } from "@/features/interviews/interview-section";
import { ApplicationStage } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";

interface CandidateDetailWorkspaceProps {
  applicationId: string;
}

export function CandidateDetailWorkspace({
  applicationId,
}: CandidateDetailWorkspaceProps) {
  const { data: application, isLoading } = trpc.application.getById.useQuery({
    id: applicationId,
  });

  const { data: duplicateCheck } =
    trpc.application.checkDuplicateEmail.useQuery(
      {
        email: application?.email ?? "",
        excludeApplicationId: applicationId,
      },
      {
        enabled: !!application?.email,
      },
    );

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
        <p className="text-body font-semibold">
          Candidate application not found
        </p>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(application.createdAt), {
    addSuffix: true,
  });
  const exactDate = format(
    new Date(application.createdAt),
    "MMMM d, yyyy 'at' h:mm a",
  );
  const isRejected = application.stage === ApplicationStage.REJECTED;
  const isHired = application.stage === ApplicationStage.HIRED;
  const hiredDateStr = application.hiredAt
    ? format(new Date(application.hiredAt), "MMMM d, yyyy")
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/recruiter/job-openings/${application.jobOpeningId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {application.jobOpening.title}
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/recruiter/job-openings/${application.jobOpeningId}/applications/${application.id}/edit`}
          >
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
              <Edit className="w-3.5 h-3.5" />
              Edit Application
            </Button>
          </Link>
          <ApplicationActions
            application={{
              id: application.id,
              stage: application.stage as ApplicationStage,
              candidateName: application.candidateName,
              stageBeforeRejection:
                application.stageBeforeRejection as ApplicationStage | null,
            }}
          />
        </div>
      </div>

      {/* Prominent Hired Status Banner */}
      {isHired && (
        <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-xs text-emerald-700 dark:text-emerald-300 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                Candidate Successfully Hired
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                This candidate has completed all hiring pipeline stages and was
                hired{hiredDateStr ? ` on ${hiredDateStr}` : ""}.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Rejected Status Banner */}
      {isRejected && (
        <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs text-rose-700 dark:text-rose-300 shadow-xs">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                Application Marked as Rejected
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Previously in{" "}
                <strong>{application.stageBeforeRejection || "APPLIED"}</strong>{" "}
                stage. Reinstating will restore this candidate back to their
                exact pre-rejection stage.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Candidate Warning Banner if duplicate exists */}
      {duplicateCheck?.isDuplicate && (
        <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[11px]">
              Duplicate Candidate Detected
            </span>
            <p>{duplicateCheck.message}</p>
          </div>
        </div>
      )}

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
              Recruiter Notes & Information
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
            stageBeforeRejection={
              application.stageBeforeRejection as ApplicationStage | null
            }
          />
        </div>
      </div>

      {/* Scheduled Interviews Section */}
      <InterviewSection applicationId={application.id} />

      {/* Recruiter Interview Panel Assignment */}
      <InterviewPanel applicationId={application.id} />

      {/* Structured Interview Feedback */}
      <InterviewFeedback applicationId={application.id} />

      {/* Immutable Application Event Timeline */}
      <ApplicationTimeline applicationId={application.id} />
    </div>
  );
}
