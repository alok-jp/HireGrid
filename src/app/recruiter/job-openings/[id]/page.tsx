import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createCaller } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/context";
import { ApplicationList } from "@/features/applications/application-list";
import { ApplicationSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Pencil, Plus } from "lucide-react";

export default async function JobOpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let jobOpening;

  try {
    jobOpening = await caller.jobOpening.getById({ id });
  } catch {
    notFound();
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
              <span>Created {new Date(jobOpening.createdAt).toLocaleDateString()}</span>
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
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 space-y-1">
        <h3 className="text-micro font-bold tracking-wider text-[var(--text-tertiary)] uppercase">
          Role Description
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
          {jobOpening.description}
        </p>
      </div>

      {/* Streaming Candidate Applications */}
      <Suspense fallback={<ApplicationSkeleton />}>
        <ApplicationList jobOpeningId={jobOpening.id} />
      </Suspense>
    </div>
  );
}
