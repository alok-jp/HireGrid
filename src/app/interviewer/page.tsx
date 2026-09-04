"use client";

import { Calendar, ClipboardList, MessageSquare } from "lucide-react";
import { Suspense } from "react";
import { ApplicationSkeleton } from "@/components/ui/skeletons";
import { InterviewerApplicationList } from "@/features/applications/interviewer-application-list";
import { trpc } from "@/trpc/client";

function InterviewerDashboardStats() {
  const { data, isLoading } = trpc.interview.myStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-3"
          >
            <div className="skeleton w-24 h-4" />
            <div className="skeleton w-16 h-8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Assigned Candidates */}
      <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[var(--text-tertiary)]">
          <span className="text-xs font-bold uppercase tracking-wider">
            Assigned Candidates
          </span>
          <ClipboardList className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div className="text-3xl font-extrabold text-[var(--text-primary)]">
          {data?.assignedCount ?? 0}
        </div>
        <p className="text-meta text-[11px]">Applications on your panel</p>
      </div>

      {/* Upcoming Interviews */}
      <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[var(--text-tertiary)]">
          <span className="text-xs font-bold uppercase tracking-wider">
            Upcoming Interviews
          </span>
          <Calendar className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-3xl font-extrabold text-[var(--text-primary)]">
          {data?.upcomingCount ?? 0}
        </div>
        <p className="text-meta text-[11px]">Scheduled in the future</p>
      </div>

      {/* Pending Feedback */}
      <div
        className={`p-5 rounded-md border shadow-xs space-y-2 ${
          (data?.feedbackCount ?? 0) > 0
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-[var(--border-subtle)] bg-[var(--surface-0)]"
        }`}
      >
        <div className="flex items-center justify-between text-[var(--text-tertiary)]">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              (data?.feedbackCount ?? 0) > 0
                ? "text-amber-700 dark:text-amber-300"
                : ""
            }`}
          >
            Pending Feedback
          </span>
          <MessageSquare
            className={`w-4 h-4 ${
              (data?.feedbackCount ?? 0) > 0
                ? "text-amber-500"
                : "text-[var(--text-tertiary)]"
            }`}
          />
        </div>
        <div
          className={`text-3xl font-extrabold ${
            (data?.feedbackCount ?? 0) > 0
              ? "text-amber-900 dark:text-amber-100"
              : "text-[var(--text-primary)]"
          }`}
        >
          {data?.feedbackCount ?? 0}
        </div>
        <p className="text-meta text-[11px]">
          {(data?.feedbackCount ?? 0) > 0
            ? "Assignments awaiting your evaluation"
            : "All evaluations submitted"}
        </p>
      </div>
    </div>
  );
}

export default function InterviewerDashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-5xl">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-display text-[var(--text-primary)]">
          Interviewer Dashboard
        </h1>
        <p className="text-meta mt-1">
          Your assigned candidates, upcoming interviews, and pending
          evaluations.
        </p>
      </div>

      {/* Metric Cards */}
      <InterviewerDashboardStats />

      {/* Assigned Applications List */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
          My Assigned Candidates
        </h2>
        <Suspense fallback={<ApplicationSkeleton />}>
          <InterviewerApplicationList />
        </Suspense>
      </div>
    </div>
  );
}
