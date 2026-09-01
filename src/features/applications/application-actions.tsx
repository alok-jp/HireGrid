"use client";

import { ApplicationStage } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";
import { canAdvance, canReject, canReinstate, getNextStage } from "@/lib/application-stage";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApplicationActionsProps {
  application: {
    id: string;
    stage: ApplicationStage | string;
    stageBeforeRejection?: ApplicationStage | string | null;
  };
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const utils = trpc.useUtils();

  const currentStage = application.stage as ApplicationStage;
  const stageBeforeRejection = application.stageBeforeRejection as ApplicationStage | null | undefined;

  const invalidateQueries = () => {
    utils.application.getByJobOpeningId.invalidate();
    utils.application.getById.invalidate();
    utils.jobOpening.list.invalidate();
  };

  const advanceMutation = trpc.application.advance.useMutation({
    onSuccess: (updated) => {
      toast.success(`Advanced to ${updated.stage}`);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to advance candidate stage");
    },
  });

  const rejectMutation = trpc.application.reject.useMutation({
    onSuccess: () => {
      toast.error("Application marked as Rejected");
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
    <div className="flex items-center gap-2">
      {/* Normal Active Application Actions */}
      {showAdvance && nextStage && (
        <Button
          size="sm"
          className="btn-primary text-xs font-semibold gap-1.5"
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

      {showReject && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30 gap-1.5"
          disabled={isPending}
          onClick={() => rejectMutation.mutate({ id: application.id })}
        >
          {rejectMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </>
          )}
        </Button>
      )}

      {/* Rejected Application Action */}
      {showReinstate && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs font-semibold gap-1.5"
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
  );
}
