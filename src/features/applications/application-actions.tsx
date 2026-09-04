"use client";

import {
  ArrowRight,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApplicationStage } from "@/generated/prisma/enums";
import {
  canAdvance,
  canReinstate,
  canReject,
  getNextStage,
} from "@/lib/application-stage";
import { trpc } from "@/trpc/client";

interface ApplicationActionsProps {
  application: {
    id: string;
    stage: ApplicationStage | string;
    candidateName?: string;
    stageBeforeRejection?: ApplicationStage | string | null;
  };
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const utils = trpc.useUtils();

  const currentStage = application.stage as ApplicationStage;

  const invalidateQueries = () => {
    utils.application.getByJobOpeningId.invalidate();
    utils.application.getById.invalidate();
    utils.application.list.invalidate();
    utils.application.getHistory.invalidate();
    utils.application.getStalledAlerts.invalidate();
    utils.application.getStalledCount.invalidate();
    utils.dashboard.getStats.invalidate();
    utils.jobOpening.list.invalidate();
  };

  const advanceMutation = trpc.application.advance.useMutation({
    onSuccess: (updated) => {
      toast.success(`Advanced candidate to ${updated.stage}`);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to advance candidate stage");
    },
  });

  const rejectMutation = trpc.application.reject.useMutation({
    onSuccess: () => {
      toast.error("Application marked as Rejected");
      setConfirmRejectOpen(false);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });

  const reinstateMutation = trpc.application.reinstate.useMutation({
    onSuccess: (updated) => {
      toast.success(`Reinstated back to ${updated.stage}`);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reinstate application");
    },
  });

  const isPending =
    advanceMutation.isPending ||
    rejectMutation.isPending ||
    reinstateMutation.isPending;

  const nextStage = getNextStage(currentStage);
  const showAdvance = canAdvance(currentStage);
  const showReject = canReject(currentStage);
  const showReinstate = canReinstate(currentStage);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Primary Action: Advance Candidate */}
        {showAdvance && nextStage && (
          <Button
            size="sm"
            className="btn-primary text-xs font-semibold gap-1.5 h-8"
            disabled={isPending}
            onClick={() => advanceMutation.mutate({ id: application.id })}
          >
            {advanceMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Advance to {nextStage}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}

        {/* Secondary Action: Separated More Actions Dropdown Menu for Reject */}
        {showReject && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-sm text-xs font-medium h-8 w-8 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] cursor-pointer outline-none transition-colors"
              disabled={isPending}
              title="More candidate actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => setConfirmRejectOpen(true)}
                className="text-xs text-rose-600 dark:text-rose-400 font-medium focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/20 cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span>Reject Candidate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Reinstatement Action for Rejected Candidates */}
        {showReinstate && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 h-8"
            disabled={isPending}
            onClick={() => reinstateMutation.mutate({ id: application.id })}
          >
            {reinstateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reinstate Application</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog for Reject */}
      <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Reject Application?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-secondary)]">
              This will move {application.candidateName || "this candidate"} to
              the <strong>REJECTED</strong> stage. You can reinstate the
              candidate back to their previous stage later if needed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRejectOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => rejectMutation.mutate({ id: application.id })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
