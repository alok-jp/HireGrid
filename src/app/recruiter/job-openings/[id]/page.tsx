import Link from "next/link";
import { notFound } from "next/navigation";
import { createCaller } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/context";
import { ApplicationList } from "@/features/applications/application-list";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Building2, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Job Openings
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {jobOpening.title}
              </h1>
              <Badge
                variant={jobOpening.status === "OPEN" ? "default" : "secondary"}
                className="font-semibold text-[10px] uppercase px-2"
              >
                {jobOpening.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{jobOpening.department}</span>
              <span>•</span>
              <span>Created {new Date(jobOpening.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/recruiter/job-openings/${jobOpening.id}/edit`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Position
            </Link>

            <Link
              href={`/recruiter/job-openings/${jobOpening.id}/applications/create`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 font-semibold text-xs")}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Candidate
            </Link>
          </div>
        </div>
      </div>

      {/* Description Summary */}
      <div className="rounded-lg border bg-card/60 p-4 space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Role Description
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {jobOpening.description}
        </p>
      </div>

      {/* Candidate Applications */}
      <ApplicationList jobOpeningId={jobOpening.id} />
    </div>
  );
}
