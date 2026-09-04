"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  MessageSquareCode,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationStageTracker } from "@/features/applications/application-stage";
import type { ApplicationStage } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";

export function InterviewerApplicationList() {
  const { data: applications, isLoading } =
    trpc.application.myAssigned.useQuery();

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

  if (!applications || applications.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-[var(--border-subtle)] rounded-md">
        <UserCheck className="h-10 w-10 text-[var(--text-tertiary)] mx-auto mb-3" />
        <p className="text-body font-semibold text-[var(--text-primary)]">
          No assigned candidate applications yet
        </p>
        <p className="text-meta mt-1 max-w-sm mx-auto">
          When a recruiter assigns you to an interview panel for candidate
          evaluation, the applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-meta font-semibold">
          My Assigned Applications ({applications.length})
        </span>
      </div>

      <div className="space-y-4">
        {applications.map((app) => {
          const timeAgo = formatDistanceToNow(new Date(app.createdAt), {
            addSuffix: true,
          });

          return (
            <div
              key={app.id}
              className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-[var(--border-default)] transition-colors space-y-4 shadow-xs"
            >
              {/* Header Row: Candidate Info & Job Opening */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/interviewer/applications/${app.id}`}
                      className="text-title text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline transition-colors"
                    >
                      {app.candidateName}
                    </Link>
                    <span className="text-meta">· {app.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-meta text-xs">
                    <div className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{app.jobOpening.title}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{app.jobOpening.department}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied {timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/interviewer/applications/${app.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 h-8"
                    >
                      <MessageSquareCode className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Evaluate & Submit Feedback</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Notes if available */}
              {app.notes ? (
                <div className="text-xs text-[var(--text-secondary)] bg-[var(--surface-1)] p-3 rounded-sm border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1 text-[10px]">
                    Candidate Notes
                  </span>
                  <p className="whitespace-pre-line leading-relaxed">
                    {app.notes}
                  </p>
                </div>
              ) : null}

              {/* Pipeline Stage Tracker */}
              <ApplicationStageTracker
                stage={app.stage as ApplicationStage}
                stageBeforeRejection={
                  app.stageBeforeRejection as ApplicationStage | null
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
