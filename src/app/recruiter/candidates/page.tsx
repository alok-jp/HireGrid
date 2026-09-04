import { Suspense } from "react";
import { ApplicationSkeleton } from "@/components/ui/skeletons";
import { CandidateSearchList } from "@/features/applications/candidate-search-list";

// Force fresh server render on navigation — ensures correct data after stage mutations.
export const dynamic = "force-dynamic";

export default function CandidatesPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-6xl">
      <div className="border-b border-(--border-subtle) pb-4">
        <h1 className="text-display text-(--text-primary)">
          Candidate Search & Pipeline
        </h1>
        <p className="text-meta mt-1">
          Search candidate applications across all positions with server-side
          filtering, sorting, and pagination.
        </p>
      </div>

      <Suspense fallback={<ApplicationSkeleton />}>
        <CandidateSearchList />
      </Suspense>
    </div>
  );
}
