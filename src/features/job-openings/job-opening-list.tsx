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
import {
  Pencil,
  Archive,
  RotateCcw,
  MoreHorizontal,
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface JobOpeningListProps {
  status?: "OPEN" | "ARCHIVED";
}

export function JobOpeningList({ status = "OPEN" }: JobOpeningListProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.jobOpening.list.useQuery({ status });

  const archiveMutation = trpc.jobOpening.archive.useMutation({
    onSuccess: () => {
      toast.success("Job opening archived");
      utils.jobOpening.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive job opening");
    },
  });

  const restoreMutation = trpc.jobOpening.restore.useMutation({
    onSuccess: () => {
      toast.success("Job opening restored");
      utils.jobOpening.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore job opening");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-transparent bg-[var(--surface-1)]"
          >
            <div className="space-y-2">
              <div className="skeleton w-48 h-4" />
              <div className="skeleton w-32 h-3" />
            </div>
            <div className="skeleton w-16 h-6" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-md)]">
        <h3 className="text-title">
          {status === "OPEN" ? "No active positions" : "No archived positions"}
        </h3>
        <p className="text-meta mt-1">
          {status === "OPEN"
            ? "Create a position to start receiving candidate applications."
            : "Positions that you archive will appear here."}
        </p>
        {status === "OPEN" && (
          <div className="mt-4">
            <Link href="/recruiter/job-openings/create" className="btn-primary inline-flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Create Position
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((job) => {
        const isActionPending =
          archiveMutation.isPending || restoreMutation.isPending;

        const timeAgo = formatDistanceToNow(new Date(job.createdAt), {
          addSuffix: true,
        });

        return (
          <Link
            key={job.id}
            href={`/recruiter/job-openings/${job.id}`}
            className="flex items-center justify-between px-5 py-4 rounded-[var(--radius-md)] border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--surface-1)] transition-all group"
          >
            {/* Title & Metadata Line */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-title text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {job.title}
                </h3>
                {job.status === "ARCHIVED" && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--status-archived)]">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-meta">
                {job.department} · Posted {timeAgo}
              </p>
            </div>

            {/* Right Side: Applicant Count & Overflow Menu */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-sm">
                <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span>{job._count?.applications ?? 0}</span>
              </div>

              {/* Overflow Action Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors outline-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/recruiter/job-openings/${job.id}/edit`);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit posting
                  </DropdownMenuItem>

                  {job.status === "OPEN" ? (
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isActionPending}
                      onClick={(e) => {
                        e.preventDefault();
                        archiveMutation.mutate({ id: job.id });
                      }}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive position
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={isActionPending}
                      onClick={(e) => {
                        e.preventDefault();
                        restoreMutation.mutate({ id: job.id });
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore position
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Link>
        );
      })}
    </div>
  );
}