import { JobOpeningForm } from "@/features/job-openings/job-opening-form";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function EditJobOpeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let jobOpening:
    | Awaited<ReturnType<typeof caller.jobOpening.getById>>
    | undefined;

  try {
    jobOpening = await caller.jobOpening.getById({ id });
  } catch {
    jobOpening = undefined;
  }

  if (!jobOpening) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4 text-center space-y-4">
        <div className="p-8 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Edit Unavailable
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Job Opening Not Found
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            This job opening cannot be edited because it has been deleted,
            archived, or does not exist.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="/recruiter/job-openings"
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <span>Back to Job Openings</span>
            </a>
            <a
              href="/recruiter/job-openings/create"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <span>Create New Opening</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <JobOpeningForm jobOpening={jobOpening} />
    </div>
  );
}
