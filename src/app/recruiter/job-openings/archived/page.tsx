import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { JobOpeningSkeleton } from "@/components/ui/skeletons";
import { JobOpeningList } from "@/features/job-openings/job-opening-list";

export default function ArchivedJobOpeningsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">
            Archived Job Openings
          </h1>
          <p className="text-meta mt-1">
            View and restore archived job positions.
          </p>
        </div>

        <Link
          href="/recruiter/job-openings"
          className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Open Positions
        </Link>
      </div>

      <Suspense fallback={<JobOpeningSkeleton />}>
        <JobOpeningList status="ARCHIVED" />
      </Suspense>
    </div>
  );
}
