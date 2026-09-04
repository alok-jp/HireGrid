import { Suspense } from "react";
import { ApplicationSkeleton } from "@/components/ui/skeletons";
import { CandidateSearchList } from "@/features/applications/candidate-search-list";

// Force fresh server render — prevents Next.js router cache from serving stale data
// after navigating from the dashboard HIRED count card.
export const dynamic = "force-dynamic";

export default function RecruiterHiredCandidatesPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-6xl">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-display text-[var(--text-primary)]">
          Hired Candidates
        </h1>
        <p className="text-meta mt-1">
          Archive of candidates who have successfully completed all pipeline
          stages and been hired.
        </p>
      </div>

      <Suspense fallback={<ApplicationSkeleton />}>
        <CandidateSearchList forcedMode="HIRED" />
      </Suspense>
    </div>
  );
}
