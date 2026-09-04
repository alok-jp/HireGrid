import { ArrowLeft, Compass, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface-0)]">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            404 · Page Not Found
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Resource Unavailable
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The page, record, or link you are looking for does not exist, has
            been deleted, or the address may be incorrect.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/login"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
