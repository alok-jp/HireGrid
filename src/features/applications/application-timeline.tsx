"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  History,
  MessageSquareQuote,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/client";

interface ApplicationTimelineProps {
  applicationId: string;
}

interface TimelineHistoryEvent {
  id: string;
  applicationId: string;
  type: string;
  actorId: string;
  oldStage?: string | null;
  newStage?: string | null;
  interviewId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string | Date;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  interview?: {
    id: string;
    scheduledAt: string | Date;
    duration?: number | null;
    status: string;
  } | null;
}

export function ApplicationTimeline({
  applicationId,
}: ApplicationTimelineProps) {
  const {
    data: rawEvents,
    isLoading,
    error,
  } = trpc.application.getHistory.useQuery(
    { applicationId },
    { refetchOnWindowFocus: false },
  );

  const events = (rawEvents as unknown as TimelineHistoryEvent[]) ?? [];

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="h-4 w-4 text-sky-600" /> Application History &
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            Loading activity timeline...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !rawEvents) {
    return (
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="h-4 w-4 text-sky-600" /> Application History &
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-slate-500">
            {error?.message || "Failed to load application timeline."}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="h-4 w-4 text-sky-600" /> Application History &
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-slate-500">
            No history recorded yet for this application.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <History className="h-4 w-4 text-sky-600 dark:text-sky-400" />{" "}
            Immutable Application Timeline
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs font-normal text-slate-500"
          >
            {events.length} events logged
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {events.map((event) => {
            const eventDate = new Date(event.createdAt);
            const formattedTime = format(eventDate, "MMM d, yyyy 'at' h:mm a");
            const relativeTime = formatDistanceToNow(eventDate, {
              addSuffix: true,
            });
            // biome-ignore lint/suspicious/noExplicitAny: metadata is a flexible JSON blob from the DB
            const metadata = (event.metadata as Record<string, any>) || {};
            const actorName = event.actor?.name || "User";
            const actorRole = event.actor?.role
              ? event.actor.role.replace("_", " ")
              : "USER";

            return (
              <div key={event.id} className="relative group">
                <div className="absolute -left-[1.875rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900">
                  {event.type === "CREATED" && (
                    <User className="h-4 w-4 text-emerald-600" />
                  )}
                  {event.type === "STAGE_CHANGED" && (
                    <ArrowRight className="h-4 w-4 text-sky-600" />
                  )}
                  {event.type === "REJECTED" && (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  )}
                  {event.type === "REINSTATED" && (
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                  )}
                  {event.type === "FEEDBACK_ADDED" && (
                    <MessageSquareQuote className="h-4 w-4 text-indigo-600" />
                  )}
                  {(event.type === "INTERVIEW_SCHEDULED" ||
                    event.type === "INTERVIEW_RESCHEDULED" ||
                    event.type === "INTERVIEW_CANCELLED") && (
                    <Calendar className="h-4 w-4 text-violet-600" />
                  )}
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {event.type === "CREATED" && "Application Created"}
                        {event.type === "STAGE_CHANGED" && "Stage Advanced"}
                        {event.type === "REJECTED" && "Application Rejected"}
                        {event.type === "REINSTATED" &&
                          "Application Reinstated"}
                        {event.type === "FEEDBACK_ADDED" &&
                          "Interviewer Feedback Submitted"}
                        {event.type === "INTERVIEW_SCHEDULED" &&
                          "Interview Scheduled"}
                        {event.type === "INTERVIEW_RESCHEDULED" &&
                          "Interview Rescheduled"}
                        {event.type === "INTERVIEW_CANCELLED" &&
                          "Interview Cancelled"}
                      </span>
                      <span className="text-xs text-slate-500">
                        by{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {actorName}
                        </span>{" "}
                        ({actorRole})
                      </span>
                    </div>
                    <span
                      className="text-xs text-slate-400"
                      title={formattedTime}
                    >
                      {relativeTime}
                    </span>
                  </div>

                  {event.type === "STAGE_CHANGED" &&
                    event.oldStage &&
                    event.newStage && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px]"
                        >
                          {event.oldStage}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <Badge className="font-mono text-[11px] bg-sky-600 hover:bg-sky-700">
                          {event.newStage}
                        </Badge>
                      </div>
                    )}

                  {event.type === "REJECTED" && event.oldStage && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        {event.oldStage}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge
                        variant="destructive"
                        className="font-mono text-[11px]"
                      >
                        REJECTED
                      </Badge>
                    </div>
                  )}

                  {event.type === "REINSTATED" && event.newStage && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Badge
                        variant="destructive"
                        className="font-mono text-[11px]"
                      >
                        REJECTED
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge className="font-mono text-[11px] bg-amber-600 hover:bg-amber-700">
                        {event.newStage}
                      </Badge>
                    </div>
                  )}

                  {event.type === "FEEDBACK_ADDED" &&
                    metadata.recommendation && (
                      <div className="mt-2.5 rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="outline"
                            className={
                              metadata.recommendation.includes("HIRE") &&
                              !metadata.recommendation.includes("NO")
                                ? "border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                : "border-rose-500 text-rose-700 dark:text-rose-400"
                            }
                          >
                            {String(metadata.recommendation).replace("_", " ")}
                          </Badge>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Tech: {metadata.technicalRating}/5</span>
                            <span>Comm: {metadata.communicationRating}/5</span>
                            <span>
                              Problem: {metadata.problemSolvingRating}/5
                            </span>
                          </div>
                        </div>
                        {metadata.comments && (
                          <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-400 line-clamp-2">
                            &ldquo;{metadata.comments}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                  {event.type === "INTERVIEW_SCHEDULED" &&
                    metadata.scheduledAt && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {format(
                            new Date(metadata.scheduledAt),
                            "MMM d, h:mm a",
                          )}{" "}
                          ({metadata.duration} mins)
                        </span>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
