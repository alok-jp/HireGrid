"use client";

import { format } from "date-fns";
import { Calendar, Clock, Loader2, UserCheck } from "lucide-react";
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

  const { data: assignableInterviewers } =
    trpc.application.getAssignableInterviewers.useQuery();

  useEffect(() => {
    if (open) {
      if (interviewToEdit) {
        const d = new Date(interviewToEdit.scheduledAt);
        setDateStr(format(d, "yyyy-MM-dd"));
        setTimeStr(format(d, "HH:mm"));
        setDuration(interviewToEdit.duration ?? 60);
        setSelectedInterviewerIds(
          interviewToEdit.interviewers.map((i) => i.interviewer.id),
        );
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDateStr(format(tomorrow, "yyyy-MM-dd"));
        setTimeStr("10:00");
        setDuration(60);
        setSelectedInterviewerIds([]);
      }
    }
  }, [open, interviewToEdit]);

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
    if (!dateStr || !timeStr) {
      toast.error("Please select a date and time for the interview.");
      return;
    }

    if (selectedInterviewerIds.length === 0) {
      toast.error("Please select at least one interviewer for the panel.");
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
              : "Set date, time, duration, and interviewer panel members."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Interview Date
              </span>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                disabled={isPending}
                className="text-xs h-9 bg-[var(--surface-1)] border-[var(--border-subtle)]"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Start Time
              </span>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                disabled={isPending}
                className="text-xs h-9 bg-[var(--surface-1)] border-[var(--border-subtle)]"
                required
              />
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

          {/* Interviewers Multi-Select */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              Assigned Interviewers
            </span>

            {!assignableInterviewers || assignableInterviewers.length === 0 ? (
              <div className="p-3 text-xs text-[var(--text-tertiary)] bg-[var(--surface-1)] border border-dashed rounded-sm">
                No interviewers registered yet.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-md bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                {assignableInterviewers.map((user) => {
                  const isChecked = selectedInterviewerIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleToggleInterviewer(user.id)}
                      className={`w-full p-2 rounded-sm text-xs flex items-center justify-between transition-colors text-left ${
                        isChecked
                          ? "bg-[var(--surface-2)] font-semibold text-[var(--accent)]"
                          : "hover:bg-[var(--surface-0)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div>
                        <span>{user.name}</span>
                        <span className="text-meta block text-[10px] text-[var(--text-tertiary)]">
                          {user.email}
                        </span>
                      </div>
                      {isChecked && (
                        <UserCheck className="w-4 h-4 text-[var(--accent)]" />
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
              disabled={isPending}
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
