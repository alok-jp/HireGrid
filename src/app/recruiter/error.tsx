"use client";

import { AlertTriangle, Briefcase, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RecruiterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Recruiter portal error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 sm:p-12 max-w-2xl text-center space-y-6">
      <div className="p-8 sm:p-10 rounded-lg border border-rose-500/30 bg-[var(--surface-0)] space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Recruiter Workspace Error
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Unable to Complete Request
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {error?.message ||
              "An unexpected issue occurred while rendering this recruiter page or loading data."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Button
            size="sm"
            onClick={() => reset()}
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/recruiter/job-openings"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings</span>
          </Link>
          <Link
            href="/recruiter"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <span>Recruiter Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
