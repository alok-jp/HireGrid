"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface-0)]">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Application Error
          </span>
          <h1 className="text-display text-[var(--text-primary)]">
            Something Went Wrong
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {error?.message ||
              "An unexpected error occurred while loading this page. Please try again or return home."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            onClick={() => reset()}
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
