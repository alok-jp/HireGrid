"use client";

import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, Loader2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  interviewToEdit?: {
    id: string;
    scheduledAt: Date | string;
    duration?: number | null;
    interviewers: Array<{ interviewer: { id: string; name: string } }>;
  } | null;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId,
  interviewToEdit,
}: ScheduleInterviewDialogProps) {
  const utils = trpc.useUtils();
  const isEditing = !!interviewToEdit;

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("10:00");
  const [duration, setDuration] = useState<number>(60);
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<
    string[]
  >([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Strictly query ONLY the interviewers assigned to this specific candidate's application
  const { data: assignedInterviewers, isLoading: isLoadingInterviewers } =
    trpc.application.getInterviewers.useQuery(
      { applicationId },
      { enabled: open && !!applicationId },
    );

  useEffect(() => {
    if (open) {
      setDateError(null);
      setTimeError(null);
      if (interviewToEdit) {
        const d = new Date(interviewToEdit.scheduledAt);
        setDateStr(format(d, "yyyy-MM-dd"));
        setTimeStr(format(d, "HH:mm"));
        setDuration(interviewToEdit.duration ?? 60);
        setSelectedInterviewerIds(
          interviewToEdit.interviewers.map((i) => i.interviewer.id),
        );
      } else {
        // Must start empty so the user is required to supply a valid interview date
        setDateStr("");
        setTimeStr("10:00");
        setDuration(60);
        setSelectedInterviewerIds([]);
      }
    }
  }, [open, interviewToEdit]);

  // If there is only one assigned interviewer and none selected yet, select it automatically for convenience
  useEffect(() => {
    if (
      open &&
      !isEditing &&
      assignedInterviewers &&
      assignedInterviewers.length === 1 &&
      selectedInterviewerIds.length === 0
    ) {
      setSelectedInterviewerIds([assignedInterviewers[0].id]);
    }
  }, [open, isEditing, assignedInterviewers, selectedInterviewerIds.length]);

  const createMutation = trpc.interview.create.useMutation({
    onSuccess: () => {
      toast.success("Interview scheduled successfully.");
      utils.interview.listForApplication.invalidate({ applicationId });
      utils.interview.listUpcoming.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to schedule interview.");
    },
  });

  const updateMutation = trpc.interview.update.useMutation({
    onSuccess: () => {
      toast.success("Interview rescheduled successfully.");
      utils.interview.listForApplication.invalidate({ applicationId });
      utils.interview.listUpcoming.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reschedule interview.");
    },
  });

  const handleToggleInterviewer = (interviewerId: string) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(interviewerId)
        ? prev.filter((id) => id !== interviewerId)
        : [...prev, interviewerId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    setTimeError(null);

    let hasError = false;

    if (!dateStr || !dateStr.trim()) {
      setDateError("Interview date is required.");
      toast.error("Interview date is required.");
      hasError = true;
    } else {
      const parsedDate = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        setDateError("Interview date is required and must be a valid date.");
        toast.error("Interview date is required and must be a valid date.");
        hasError = true;
      }
    }

    if (!timeStr || !timeStr.trim()) {
      setTimeError("Interview time is required.");
      toast.error("Interview time is required.");
      hasError = true;
    }

    if (!assignedInterviewers || assignedInterviewers.length === 0) {
      toast.error(
        "This candidate has no assigned interviewers. Please assign interviewers to the candidate's panel first.",
      );
      hasError = true;
    } else if (selectedInterviewerIds.length === 0) {
      toast.error(
        "Please select at least one assigned interviewer for the interview.",
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const scheduledAtIso = new Date(`${dateStr}T${timeStr}:00`).toISOString();

    if (isEditing && interviewToEdit) {
      updateMutation.mutate({
        id: interviewToEdit.id,
        scheduledAt: scheduledAtIso,
        duration,
        interviewerIds: selectedInterviewerIds,
      });
    } else {
      createMutation.mutate({
        applicationId,
        scheduledAt: scheduledAtIso,
        duration,
        interviewerIds: selectedInterviewerIds,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasNoInterviewers =
    !isLoadingInterviewers &&
    (!assignedInterviewers || assignedInterviewers.length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--accent)]" />
            <span>
              {isEditing ? "Reschedule Interview" : "Schedule Interview"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-secondary)]">
            {isEditing
              ? "Update interview date, time, and assigned interviewer panel."
              : "Set date, time, duration, and select interviewers from the candidate's assigned panel."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Interview Date <span className="text-red-500">*</span>
              </span>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  if (dateError) setDateError(null);
                }}
                disabled={isPending}
                className={`text-xs h-9 bg-[var(--surface-1)] ${
                  dateError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-[var(--border-subtle)]"
                }`}
                required
              />
              {dateError && (
                <p className="text-[11px] text-red-500 font-medium">
                  {dateError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Start Time <span className="text-red-500">*</span>
              </span>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => {
                  setTimeStr(e.target.value);
                  if (timeError) setTimeError(null);
                }}
                disabled={isPending}
                className={`text-xs h-9 bg-[var(--surface-1)] ${
                  timeError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-[var(--border-subtle)]"
                }`}
                required
              />
              {timeError && (
                <p className="text-[11px] text-red-500 font-medium">
                  {timeError}
                </p>
              )}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              Duration
            </span>
            <Select
              value={duration.toString()}
              onValueChange={(val: string | null) => {
                if (val) setDuration(parseInt(val, 10));
              }}
            >
              <SelectTrigger className="w-full text-xs h-9 bg-[var(--surface-1)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30" label="30 Minutes">
                  30 Minutes
                </SelectItem>
                <SelectItem value="45" label="45 Minutes">
                  45 Minutes
                </SelectItem>
                <SelectItem value="60" label="60 Minutes (1 Hour)">
                  60 Minutes (1 Hour)
                </SelectItem>
                <SelectItem value="90" label="90 Minutes (1.5 Hours)">
                  90 Minutes (1.5 Hours)
                </SelectItem>
                <SelectItem value="120" label="120 Minutes (2 Hours)">
                  120 Minutes (2 Hours)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interviewers Multi-Select (Strictly Assigned Panel) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                Assigned Panel Interviewers{" "}
                <span className="text-red-500">*</span>
              </span>
              {assignedInterviewers && assignedInterviewers.length > 0 && (
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal">
                  {selectedInterviewerIds.length} of{" "}
                  {assignedInterviewers.length} selected
                </span>
              )}
            </div>

            {isLoadingInterviewers ? (
              <div className="p-4 text-xs text-[var(--text-tertiary)] bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-md flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span>Loading assigned panel...</span>
              </div>
            ) : hasNoInterviewers ? (
              <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 rounded-md text-[var(--text-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No Interviewers Assigned to Candidate</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--text-tertiary)]">
                  This candidate currently has no interviewers assigned to their
                  panel. Please assign at least one interviewer in the Interview
                  Panel section below before scheduling an interview.
                </p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-md bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                {assignedInterviewers?.map((user) => {
                  const isChecked = selectedInterviewerIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleToggleInterviewer(user.id)}
                      className={`w-full p-2 rounded-sm text-xs flex items-center justify-between transition-colors text-left ${
                        isChecked
                          ? "bg-[var(--surface-2)] font-semibold text-[var(--accent)] border border-[var(--accent)]/30"
                          : "hover:bg-[var(--surface-0)] text-[var(--text-primary)] border border-transparent"
                      }`}
                    >
                      <div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {user.name}
                        </span>
                        <span className="text-meta block text-[10px] text-[var(--text-tertiary)]">
                          {user.email}
                        </span>
                      </div>
                      {isChecked ? (
                        <UserCheck className="w-4 h-4 text-[var(--accent)]" />
                      ) : (
                        <div className="w-4 h-4 rounded-xs border border-[var(--border-subtle)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="btn-primary text-xs"
              disabled={isPending || isLoadingInterviewers || hasNoInterviewers}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isEditing ? (
                "Update Interview"
              ) : (
                "Schedule Interview"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
