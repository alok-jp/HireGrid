import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { ApplicationForm } from "@/features/applications/application-form";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id, applicationId } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let application:
    | Awaited<ReturnType<typeof caller.application.getById>>
    | undefined;

  try {
    application = await caller.application.getById({ id: applicationId });
  } catch {
    application = undefined;
  }

  if (!application) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4 text-center space-y-4">
        <div className="p-8 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Application Unavailable
            </span>
            <h1 className="text-display text-[var(--text-primary)]">
              Cannot Edit Application
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              This candidate application cannot be edited because it was deleted
              or does not exist.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={`/recruiter/job-openings/${id}`}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Job Opening</span>
            </Link>
            <Link
              href="/recruiter/candidates"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <span>View Candidates</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <ApplicationForm jobOpeningId={id} application={application} />
    </div>
  );
}
