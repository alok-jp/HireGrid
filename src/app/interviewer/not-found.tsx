import { ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";

export default function InterviewerNotFound() {
  return (
    <div className="container mx-auto p-6 sm:p-12 max-w-2xl text-center space-y-6">
      <div className="p-8 sm:p-10 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Application Not Found
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Candidate Evaluation Unavailable
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            This candidate application could not be found, has been removed, or
            is not assigned to your interviewer account.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <Link
            href="/interviewer"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Assigned Applications</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
