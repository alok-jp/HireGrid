"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ScheduleInterviewDialog } from "@/features/interviews/schedule-interview-dialog";
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { InterviewStatus } from "@/generated/prisma/enums";

interface InterviewSectionProps {
  applicationId: string;
  isRecruiter?: boolean;
}

const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; colorClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  SCHEDULED: {
    label: "Scheduled",
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: CalendarDays,
  },
  COMPLETED: {
    label: "Completed",
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: XCircle,
  },
};

export function InterviewSection({
  applicationId,
  isRecruiter = true,
}: InterviewSectionProps) {
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<any>(null);

  const { data: interviews, isLoading } = trpc.interview.listForApplication.useQuery({
    applicationId,
  });

  const cancelMutation = trpc.interview.cancel.useMutation({
    onSuccess: () => {
      toast.success("Interview cancelled.");
      utils.interview.listForApplication.invalidate({ applicationId });
      utils.interview.listUpcoming.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel interview.");
    },
  });

  const completeMutation = trpc.interview.complete.useMutation({
    onSuccess: () => {
      toast.success("Interview marked as completed.");
      utils.interview.listForApplication.invalidate({ applicationId });
      utils.interview.listUpcoming.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to complete interview.");
    },
  });

  const handleOpenScheduleNew = () => {
    setEditingInterview(null);
    setDialogOpen(true);
  };

  const handleOpenReschedule = (interview: any) => {
    setEditingInterview(interview);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Scheduled Interviews ({interviews?.length ?? 0})
          </span>
        </div>

        {isRecruiter && (
          <Button
            size="sm"
            onClick={handleOpenScheduleNew}
            className="btn-primary text-xs gap-1.5 h-7"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Interview</span>
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading scheduled interviews...
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <div className="py-4 text-center border border-dashed border-[var(--border-subtle)] rounded-sm">
          <p className="text-xs text-[var(--text-tertiary)]">
            No interviews scheduled for this candidate yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status as InterviewStatus] || {
              label: item.status,
              colorClass: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
              icon: CalendarDays,
            };
            const StatusIcon = statusCfg.icon;
            const scheduledDate = new Date(item.scheduledAt);
            const dateDisplay = format(scheduledDate, "EEEE, MMMM d, yyyy");
            const timeDisplay = format(scheduledDate, "h:mm a");

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-md bg-[var(--surface-0)] border border-[var(--border-subtle)] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[11px] border flex items-center gap-1.5 ${statusCfg.colorClass}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusCfg.label}</span>
                    </span>
                    <span className="text-[var(--text-tertiary)]">•</span>
                    <div className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{timeDisplay}</span>
                      <span>({item.duration ?? 60} mins)</span>
                    </div>
                  </div>

                  <span className="font-semibold text-[var(--text-secondary)]">
                    {dateDisplay}
                  </span>
                </div>

                {/* Panel Members List */}
                <div className="flex items-center gap-2 bg-[var(--surface-1)] p-2 rounded-sm text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="text-[var(--text-tertiary)] font-bold">Panel:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.interviewers.map((i) => (
                      <span
                        key={i.interviewer.id}
                        className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] font-semibold text-[var(--text-primary)]"
                      >
                        {i.interviewer.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Accessible to both recruiters & assigned interviewers */}
                {item.status === "SCHEDULED" && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border-subtle)]">
                    {isRecruiter && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReschedule(item)}
                        className="text-[11px] h-7 gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reschedule
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeMutation.mutate({ id: item.id })}
                      disabled={completeMutation.isPending}
                      className="text-[11px] h-7 gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Completed
                    </Button>

                    {isRecruiter && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelMutation.mutate({ id: item.id })}
                        disabled={cancelMutation.isPending}
                        className="text-[11px] h-7 gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scheduling Dialog */}
      <ScheduleInterviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        applicationId={applicationId}
        interviewToEdit={editingInterview}
      />
    </div>
  );
}
