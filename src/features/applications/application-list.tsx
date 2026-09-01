"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, MoreHorizontal, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationListProps {
  jobOpeningId: string;
}

const STAGE_COLOR: Record<string, string> = {
  Applied: "var(--text-tertiary)",
  Screening: "var(--status-pending)",
  Interview: "var(--accent)",
  Offer: "var(--status-active)",
  Rejected: "#dc2626",
};

export function ApplicationList({ jobOpeningId }: ApplicationListProps) {
  const router = useRouter();
  const { data, isLoading } = trpc.application.getByJobOpeningId.useQuery({
    jobOpeningId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-4 rounded-[var(--radius-sm)] border-l-4 border-l-transparent bg-[var(--surface-1)]">
            <div className="skeleton w-36 h-4 mb-1" />
            <div className="skeleton w-24 h-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-meta font-semibold">
          Candidates ({data?.length ?? 0})
        </span>

        <Link
          href={`/recruiter/job-openings/${jobOpeningId}/applications/create`}
          className="btn-primary inline-flex items-center gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Candidate
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-md)]">
          <UserCheck className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <p className="text-body font-semibold">No candidate applications yet</p>
          <p className="text-meta mt-1 mb-4">
            Add candidates to begin tracking them through the hiring stages.
          </p>
          <Link
            href={`/recruiter/job-openings/${jobOpeningId}/applications/create`}
            className="btn-primary inline-flex items-center gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Candidate
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {data.map((app) => {
            const stageColor = STAGE_COLOR[app.stage] || "var(--text-secondary)";
            const timeAgo = formatDistanceToNow(new Date(app.createdAt), {
              addSuffix: true,
            });

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-3.5 rounded-r-[var(--radius-sm)] border-l-[3px] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-colors group"
                style={{ borderLeftColor: stageColor }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-semibold">{app.candidateName}</span>
                    <span className="text-meta">· {app.email}</span>
                  </div>
                  <div className="text-meta text-xs">
                    {app.source} · Applied {timeAgo}
                    {app.notes ? <span className="ml-2 text-[var(--text-tertiary)] line-clamp-1 italic">— {app.notes}</span> : null}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className="text-meta font-semibold"
                    style={{ color: stageColor }}
                  >
                    {app.stage}
                  </span>

                  {/* Contextual Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors outline-none">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/recruiter/job-openings/${jobOpeningId}/applications/${app.id}/edit`,
                          )
                        }
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit Candidate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
