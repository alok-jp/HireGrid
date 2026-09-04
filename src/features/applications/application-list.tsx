"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationActions } from "@/features/applications/application-actions";
import { ApplicationStageTracker } from "@/features/applications/application-stage";
import { InterviewPanel } from "@/features/applications/interview-panel";
import type { ApplicationStage } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";

interface ApplicationListProps {
  jobOpeningId: string;
}

export function ApplicationList({ jobOpeningId }: ApplicationListProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } =
    trpc.application.getByJobOpeningId.useQuery({
      jobOpeningId,
    });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-4 rounded-md border bg-[var(--surface-1)] space-y-3"
          >
            <div className="skeleton w-36 h-4" />
            <div className="skeleton w-full h-8" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 text-center border border-dashed border-rose-500/30 bg-rose-500/5 rounded-md space-y-2">
        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
          Unable to load candidate applications for this position.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs text-[var(--accent)] hover:underline font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-meta font-semibold">
          Candidates ({data?.length ?? 0})
        </span>

        <Link
          href={`/recruiter/job-openings/${jobOpeningId}/applications/create`}
          className="btn-primary inline-flex items-center gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Candidate
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[var(--border-subtle)] rounded-md">
          <UserCheck className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <p className="text-body font-semibold">
            No candidate applications yet
          </p>
          <p className="text-meta mt-1 mb-4">
            Add candidates to begin tracking them through the hiring stages.
          </p>
          <Link
            href={`/recruiter/job-openings/${jobOpeningId}/applications/create`}
            className="btn-primary inline-flex items-center gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Candidate
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((app) => {
            const timeAgo = formatDistanceToNow(new Date(app.createdAt), {
              addSuffix: true,
            });

            return (
              <div
                key={app.id}
                className="p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-[var(--border-default)] transition-colors space-y-4"
              >
                {/* Header Row: Candidate Info & Stage Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/job-openings/${jobOpeningId}/applications/${app.id}`}
                        className="text-body font-bold text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{app.candidateName}</span>
                        <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)]" />
                      </Link>
                      <span className="text-meta">· {app.email}</span>
                    </div>
                    <div className="text-meta text-xs">
                      <span className="font-semibold">{app.source}</span> ·
                      Applied {timeAgo}
                      {app.notes ? (
                        <span className="ml-2 text-[var(--text-tertiary)] italic">
                          — {app.notes}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Advance / Reject / Reinstate Action Buttons */}
                    <ApplicationActions
                      application={{
                        id: app.id,
                        stage: app.stage as ApplicationStage,
                        stageBeforeRejection:
                          app.stageBeforeRejection as ApplicationStage | null,
                      }}
                    />

                    {/* Overflow Edit Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/recruiter/job-openings/${jobOpeningId}/applications/${app.id}`,
                            )
                          }
                        >
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          View Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/recruiter/job-openings/${jobOpeningId}/applications/${app.id}/edit`,
                            )
                          }
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Pipeline Visual Step Tracker */}
                <ApplicationStageTracker
                  stage={app.stage as ApplicationStage}
                  stageBeforeRejection={
                    app.stageBeforeRejection as ApplicationStage | null
                  }
                />

                {/* Interview Panel Assignment Section */}
                <InterviewPanel applicationId={app.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
