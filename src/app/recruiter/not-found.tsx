import { Briefcase, FolderSearch, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function RecruiterNotFound() {
  return (
    <div className="container mx-auto p-6 sm:p-12 max-w-2xl text-center space-y-6">
      <div className="p-8 sm:p-10 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Recruiting Record Not Found
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Job or Application Unavailable
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            The job opening, candidate application, or link you requested is no
            longer available. It may have been archived, removed, or the URL
            contains an invalid ID.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            href="/recruiter/job-openings"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings</span>
          </Link>
          <Link
            href="/recruiter/candidates"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <FolderSearch className="w-3.5 h-3.5" />
            <span>All Candidates</span>
          </Link>
          <Link
            href="/recruiter"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
