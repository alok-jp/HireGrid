"use client";

import { Check, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApplicationStage } from "@/generated/prisma/enums";
import { PIPELINE_ORDER } from "@/lib/application-stage";

interface ApplicationStageTrackerProps {
  stage: ApplicationStage | string;
  stageBeforeRejection?: ApplicationStage | string | null;
}

export function ApplicationStageTracker({
  stage,
  stageBeforeRejection,
}: ApplicationStageTrackerProps) {
  const isRejected = stage === ApplicationStage.REJECTED;

  if (isRejected) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-700 dark:text-red-300">
              REJECTED
            </span>
            {stageBeforeRejection && (
              <Badge
                variant="outline"
                className="text-[10px] border-red-300 text-red-700"
              >
                Was at {stageBeforeRejection}
              </Badge>
            )}
          </div>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
            Application is currently rejected. You can reinstate it back to the{" "}
            {stageBeforeRejection || "previous"} stage.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = PIPELINE_ORDER.indexOf(stage as ApplicationStage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-2">
        {PIPELINE_ORDER.map((s, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={s} className="flex items-center flex-1 min-w-[90px]">
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[var(--accent)] text-white shadow-xs ring-2 ring-[var(--accent)]/30"
                      : isPassed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-[var(--surface-2)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-tight uppercase text-center ${
                    isCurrent
                      ? "text-[var(--accent)]"
                      : isPassed
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {s}
                </span>
              </div>

              {/* Connecting line */}
              {index < PIPELINE_ORDER.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-1 -mt-4 transition-all ${
                    index < currentIndex
                      ? "bg-emerald-500"
                      : "bg-[var(--border-subtle)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
