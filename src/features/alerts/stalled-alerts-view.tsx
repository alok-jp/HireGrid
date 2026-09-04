"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/client";

export function StalledAlertsView() {
  const utils = trpc.useUtils();

  const {
    data: alerts,
    isLoading,
    error,
  } = trpc.application.getStalledAlerts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const dismissMutation = trpc.application.dismissStalledAlert.useMutation({
    onSuccess: () => {
      toast.success("Stalled application alert dismissed");
      utils.application.getStalledAlerts.invalidate();
      utils.application.getStalledCount.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to dismiss alert");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <div className="skeleton w-48 h-8" />
        <div className="skeleton w-full h-32" />
        <div className="skeleton w-full h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center max-w-xl mx-auto">
        <p className="text-body font-semibold text-rose-600 dark:text-rose-400">
          {error.message || "Failed to load stalled application alerts"}
        </p>
      </div>
    );
  }

  const alertCount = alerts?.length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-display text-[var(--text-primary)] flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span>Stalled Application Alerts</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Applications sitting in active pipeline stages (Applied, Screening,
            Interview, Offer) for more than 10 days.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start sm:self-auto px-3 py-1 text-xs font-bold gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
        >
          <span>
            {alertCount} Active Alert{alertCount === 1 ? "" : "s"}
          </span>
        </Badge>
      </div>

      {/* Empty State when no stalled candidates exist */}
      {alertCount === 0 ? (
        <Card className="border-dashed border-[var(--border-subtle)] bg-[var(--surface-0)] py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-[var(--text-primary)]">
                All Applications Moving Smoothly!
              </CardTitle>
              <p className="text-xs text-[var(--text-tertiary)] max-w-md">
                No active candidate applications have sat in a stage for more
                than 10 days without advancement or dismissal.
              </p>
            </div>
            <Link href="/recruiter/candidates" className="pt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
              >
                View All Pipeline Candidates
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Alert Cards Stack */
        <div className="space-y-4">
          {alerts?.map((alert) => {
            const startDate = new Date(alert.stageChangedAt);
            const formattedDate = format(startDate, "MMM d, yyyy");
            const isDismissing =
              dismissMutation.isPending &&
              dismissMutation.variables?.applicationId === alert.applicationId;

            return (
              <div
                key={alert.applicationId}
                className="p-5 rounded-md border border-amber-500/30 bg-[var(--surface-0)] space-y-4 shadow-xs hover:border-amber-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/job-openings/${alert.jobOpeningId}/applications/${alert.applicationId}`}
                        className="text-title text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <span>{alert.candidateName}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        · {alert.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{alert.jobTitle}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{alert.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs font-semibold px-2.5 py-1"
                    >
                      {alert.currentStage}
                    </Badge>
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs px-2.5 py-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.daysInStage} days stalled</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      In current stage since{" "}
                      <span className="font-medium text-[var(--text-secondary)]">
                        {formattedDate}
                      </span>{" "}
                      ({formatDistanceToNow(startDate, { addSuffix: true })})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/recruiter/job-openings/${alert.jobOpeningId}/applications/${alert.applicationId}`}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold h-8"
                      >
                        View Workspace
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs font-semibold h-8 gap-1.5"
                      disabled={isDismissing}
                      onClick={() =>
                        dismissMutation.mutate({
                          applicationId: alert.applicationId,
                        })
                      }
                    >
                      {isDismissing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>Dismiss Alert</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
