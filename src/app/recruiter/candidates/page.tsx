import { Suspense } from "react";
import { CandidateSearchList } from "@/features/applications/candidate-search-list";
import { ApplicationSkeleton } from "@/components/ui/skeletons";

export default function CandidatesPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-6xl">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-display text-[var(--text-primary)]">Candidate Search & Pipeline</h1>
        <p className="text-meta mt-1">
          Search candidate applications across all positions with server-side filtering, sorting, and pagination.
        </p>
      </div>

      <Suspense fallback={<ApplicationSkeleton />}>
        <CandidateSearchList />
      </Suspense>
    </div>
  );
}
