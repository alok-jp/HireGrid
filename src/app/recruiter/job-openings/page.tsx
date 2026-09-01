import { Suspense } from "react";
import Link from "next/link";
import { JobOpeningList } from "@/features/job-openings/job-opening-list";
import { JobOpeningSkeleton } from "@/components/ui/skeletons";
import { Plus, Archive } from "lucide-react";

export default function JobOpeningsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">Job Openings</h1>
          <p className="text-meta mt-1">
            Active positions and candidate recruitment requisitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/job-openings/archived"
            className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors inline-flex items-center gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </Link>

          <Link
            href="/recruiter/job-openings/create"
            className="btn-primary text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Opening
          </Link>
        </div>
      </div>

      {/* Streaming Suspense Boundary */}
      <Suspense fallback={<JobOpeningSkeleton />}>
        <JobOpeningList status="OPEN" />
      </Suspense>
    </div>
  );
}