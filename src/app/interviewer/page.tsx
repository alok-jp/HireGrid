import { Suspense } from "react";
import { InterviewerApplicationList } from "@/features/applications/interviewer-application-list";
import { ApplicationSkeleton } from "@/components/ui/skeletons";

export default function InterviewerDashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-5xl">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-display text-[var(--text-primary)]">My Panel Applications</h1>
        <p className="text-meta mt-1">
          Candidates and candidate applications assigned to you for interview evaluations across positions.
        </p>
      </div>

      <Suspense fallback={<ApplicationSkeleton />}>
        <InterviewerApplicationList />
      </Suspense>
    </div>
  );
}
