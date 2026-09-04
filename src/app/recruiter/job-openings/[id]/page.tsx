import { ArrowLeft, Building2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ApplicationSkeleton } from "@/components/ui/skeletons";
import { ApplicationList } from "@/features/applications/application-list";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function JobOpeningDetailPage({
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
      <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-4xl">
        <Link
          href="/recruiter/job-openings"
          className="inline-flex items-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Job Openings
        </Link>

        <div className="p-8 sm:p-10 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Job Opening Not Found
            </span>
            <h1 className="text-display text-[var(--text-primary)]">
              This Job Opening No Longer Exists
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              The job opening you are attempting to view may have been deleted,
              archived, or the link is no longer valid.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/recruiter/job-openings"
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Job Openings</span>
            </Link>
            <Link
              href="/recruiter/candidates"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <span>View All Candidates</span>
            </Link>
            <Link
              href="/recruiter"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8 max-w-5xl">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/recruiter/job-openings"
          className="inline-flex items-center text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Job Openings
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-title text-[var(--text-primary)]">
                {jobOpening.title}
              </h1>
              <Badge
                variant={jobOpening.status === "OPEN" ? "default" : "secondary"}
                className="font-semibold text-[10px] uppercase px-2"
              >
                {jobOpening.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Building2 className="h-3.5 w-3.5" />
              <span>{jobOpening.department}</span>
              <span>•</span>
              <span>
                Created {new Date(jobOpening.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/recruiter/job-openings/${jobOpening.id}/edit`}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors inline-flex items-center gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Position
            </Link>

            <Link
              href={`/recruiter/job-openings/${jobOpening.id}/applications/create`}
              className="btn-primary text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Candidate
            </Link>
          </div>
        </div>
      </div>

      {/* Description Summary */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-5 space-y-3">
        <h3 className="text-micro font-bold tracking-wider text-[var(--text-tertiary)] uppercase border-b border-[var(--border-subtle)] pb-2">
          Role Description
        </h3>
        <MarkdownContent content={jobOpening.description} />
      </div>

      {/* Streaming Candidate Applications */}
      <Suspense fallback={<ApplicationSkeleton />}>
        <ApplicationList jobOpeningId={jobOpening.id} />
      </Suspense>
    </div>
  );
}
