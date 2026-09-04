"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Award,
  Loader2,
  MessageSquarePlus,
  Star,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Recommendation } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";

interface InterviewFeedbackProps {
  applicationId: string;
  isAssignedInterviewer?: boolean;
}

const RECOMMENDATION_LABELS: Record<
  Recommendation,
  { label: string; colorClass: string }
> = {
  STRONG_HIRE: {
    label: "Strong Hire",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  HIRE: {
    label: "Hire",
    colorClass:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  },
  NO_HIRE: {
    label: "No Hire",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  STRONG_NO_HIRE: {
    label: "Strong No Hire",
    colorClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
};

export function InterviewFeedback({
  applicationId,
  isAssignedInterviewer = true,
}: InterviewFeedbackProps) {
  const utils = trpc.useUtils();

  const [recommendation, setRecommendation] = useState<Recommendation>("HIRE");
  const [technicalRating, setTechnicalRating] = useState<number>(4);
  const [communicationRating, setCommunicationRating] = useState<number>(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState<number>(4);
  const [comments, setComments] = useState<string>("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: feedbacks, isLoading } = trpc.application.getFeedback.useQuery({
    applicationId,
  });

  const submitMutation = trpc.application.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Interview evaluation feedback submitted");
      setComments("");
      setIsSubmittingForm(false);
      utils.application.getFeedback.invalidate({ applicationId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit evaluation feedback");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Please enter evaluation comments");
      return;
    }

    submitMutation.mutate({
      applicationId,
      recommendation,
      technicalRating,
      communicationRating,
      problemSolvingRating,
      comments: comments.trim(),
    });
  };

  const renderStarRating = (
    value: number,
    onChange?: (val: number) => void,
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            className={`p-0.5 transition-colors ${
              onChange ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-[var(--border-default)]"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Interviewer Feedback & Evaluation ({feedbacks?.length ?? 0})
          </span>
        </div>

        {isAssignedInterviewer && !isSubmittingForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSubmittingForm(true)}
            className="text-xs gap-1.5 h-7 border-[var(--border-default)] hover:bg-[var(--surface-2)]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Submit Feedback</span>
          </Button>
        )}
      </div>

      {/* Structured Feedback Submission Form */}
      {isSubmittingForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-3 rounded-md bg-[var(--surface-0)] border border-[var(--border-subtle)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Overall Recommendation */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Overall Recommendation
              </span>
              <Select
                value={recommendation}
                onValueChange={(val) =>
                  setRecommendation((val as Recommendation) ?? "HIRE")
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRONG_HIRE" label="Strong Hire">
                    Strong Hire
                  </SelectItem>
                  <SelectItem value="HIRE" label="Hire">
                    Hire
                  </SelectItem>
                  <SelectItem value="NO_HIRE" label="No Hire">
                    No Hire
                  </SelectItem>
                  <SelectItem value="STRONG_NO_HIRE" label="Strong No Hire">
                    Strong No Hire
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ratings Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-secondary)]">
                  Technical Competency
                </span>
                {renderStarRating(technicalRating, setTechnicalRating)}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-secondary)]">
                  Communication
                </span>
                {renderStarRating(communicationRating, setCommunicationRating)}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-secondary)]">
                  Problem Solving
                </span>
                {renderStarRating(
                  problemSolvingRating,
                  setProblemSolvingRating,
                )}
              </div>
            </div>
          </div>

          {/* Feedback Comments */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Evaluation Comments & Observations
            </span>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback on the candidate's interview performance, strengths, and areas for growth..."
              rows={3}
              className="text-xs bg-[var(--surface-1)] border-[var(--border-subtle)] focus-visible:ring-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubmittingForm(false)}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="btn-primary text-xs"
              disabled={submitMutation.isPending || !comments.trim()}
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save Evaluation"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Existing Feedbacks List */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading evaluation feedback...
        </div>
      ) : !feedbacks || feedbacks.length === 0 ? (
        <div className="py-3 text-center border border-dashed border-[var(--border-subtle)] rounded-sm">
          <p className="text-xs text-[var(--text-tertiary)]">
            No interview feedback has been submitted for this candidate yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => {
            const recConfig = RECOMMENDATION_LABELS[
              fb.recommendation as Recommendation
            ] || {
              label: fb.recommendation,
              colorClass: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
            };
            const timeAgo = formatDistanceToNow(new Date(fb.createdAt), {
              addSuffix: true,
            });

            return (
              <div
                key={fb.id}
                className="p-3.5 rounded-md bg-[var(--surface-0)] border border-[var(--border-subtle)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-bold text-[var(--text-primary)]">
                      {fb.interviewer?.name ?? "Former Team Member"}
                    </span>
                    {fb.interviewer?.email && (
                      <span className="text-meta">
                        ({fb.interviewer.email})
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-sm font-bold text-[11px] border ${recConfig.colorClass}`}
                  >
                    {recConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 bg-[var(--surface-1)] px-2.5 rounded-sm text-[11px]">
                  <div>
                    <span className="text-[var(--text-tertiary)] block">
                      Technical:
                    </span>
                    {renderStarRating(fb.technicalRating)}
                  </div>
                  <div>
                    <span className="text-[var(--text-tertiary)] block">
                      Communication:
                    </span>
                    {renderStarRating(fb.communicationRating)}
                  </div>
                  <div>
                    <span className="text-[var(--text-tertiary)] block">
                      Problem Solving:
                    </span>
                    {renderStarRating(fb.problemSolvingRating)}
                  </div>
                </div>

                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line pt-1">
                  {fb.comments}
                </p>

                <div className="text-[10px] text-[var(--text-tertiary)] text-right pt-1">
                  Submitted {timeAgo}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
