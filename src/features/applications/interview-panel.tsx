"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Trash2, Loader2, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface InterviewPanelProps {
  applicationId: string;
}

export function InterviewPanel({ applicationId }: InterviewPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: panel, isLoading: isLoadingPanel } =
    trpc.application.getInterviewers.useQuery({ applicationId });

  const { data: assignable, isLoading: isLoadingAssignable } =
    trpc.user.getInterviewers.useQuery(undefined, { enabled: open });

  const selectedInterviewer = assignable?.find((u) => u.id === selectedInterviewerId);
  const interviewerLabel = selectedInterviewer
    ? `${selectedInterviewer.name} (${selectedInterviewer.email})`
    : undefined;

  const invalidateQueries = () => {
    utils.application.getInterviewers.invalidate({ applicationId });
    utils.application.list.invalidate();
    utils.application.myAssigned.invalidate();
    utils.application.getByJobOpeningId.invalidate();
  };

  const assignMutation = trpc.application.assignInterviewer.useMutation({
    onSuccess: () => {
      toast.success("Interviewer assigned to panel");
      setSelectedInterviewerId("");
      setOpen(false);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign interviewer");
    },
  });

  const removeMutation = trpc.application.removeInterviewer.useMutation({
    onSuccess: () => {
      toast.success("Interviewer removed from panel");
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove interviewer");
    },
  });

  const handleAssign = () => {
    if (!selectedInterviewerId) return;
    assignMutation.mutate({
      applicationId,
      interviewerId: selectedInterviewerId,
    });
  };

  const isPending = assignMutation.isPending || removeMutation.isPending;

  return (
    <div className="space-y-3 p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Interview Panel ({panel?.length ?? 0})
          </span>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 py-1 h-7 border-[var(--border-default)] hover:bg-[var(--surface-2)]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Interviewer</span>
              </Button>
            }
          />

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Assign Panel Interviewer
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Select an interviewer to evaluate this candidate application. All registered team members are available to be assigned.
              </p>

              {isLoadingAssignable ? (
                <div className="flex items-center gap-2 py-4 text-xs text-[var(--text-tertiary)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading available interviewers...
                </div>
              ) : !assignable || assignable.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] italic py-2">
                  No interviewers found in system. Invite an interviewer via Admin portal.
                </p>
              ) : (
                <Select
                  value={selectedInterviewerId}
                  onValueChange={(val) => setSelectedInterviewerId(val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an interviewer...">
                      {interviewerLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {assignable.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        label={`${user.name} (${user.email})`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-xs">{user.name}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="btn-primary"
                  onClick={handleAssign}
                  disabled={!selectedInterviewerId || isPending}
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Assign to Panel"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingPanel ? (
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading panel members...
        </div>
      ) : !panel || panel.length === 0 ? (
        <div className="py-3 text-center border border-dashed border-[var(--border-subtle)] rounded-sm">
          <p className="text-xs text-[var(--text-tertiary)]">
            No interviewers assigned to this application yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {panel.map((interviewer: any) => (
            <div
              key={interviewer.id}
              className="flex items-center justify-between p-2.5 rounded-sm bg-[var(--surface-0)] border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0">
                  {interviewer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {interviewer.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-2 mt-0.5">
                    <span>{interviewer.email}</span>
                    {interviewer.assignedAt && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                          <Clock className="w-3 h-3 text-[var(--accent)]" />
                          <span title={format(new Date(interviewer.assignedAt), "PPpp")}>
                            Assigned {formatDistanceToNow(new Date(interviewer.assignedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                disabled={isPending}
                onClick={() =>
                  removeMutation.mutate({
                    applicationId,
                    interviewerId: interviewer.id,
                  })
                }
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
