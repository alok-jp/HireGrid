"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  RotateCcw,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

export function DashboardMetrics() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    trpc.dashboard.getStats.useQuery(undefined, {
      staleTime: 10000,
    });

  const { data: stalledData } = trpc.application.getStalledCount.useQuery(
    undefined,
    {
      staleTime: 10000,
    },
  );
  const stalledCount = stalledData?.count ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Metric Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-3"
            >
              <div className="skeleton w-24 h-4" />
              <div className="skeleton w-16 h-8" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] h-64 skeleton" />
          <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] h-64 skeleton" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-md space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-body font-semibold text-[var(--text-primary)]">
          Unable to load recruiter dashboard metrics
        </p>
        <p className="text-meta">
          {error?.message || "Something went wrong loading stats."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs font-semibold gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const activeStages = data.applicationsByStage.filter(
    (st) => st.stage !== "HIRED" && st.stage !== "REJECTED",
  );
  const outcomeStages = data.applicationsByStage.filter(
    (st) => st.stage === "HIRED" || st.stage === "REJECTED",
  );

  return (
    <div className="space-y-6">
      {/* Top Refetch Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">
            Recruiter Pipeline Dashboard
          </h1>
          <p className="text-meta mt-0.5">
            Headline metrics, stage drill-down, active interviews, and quarterly
            pipeline volume trends.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] gap-1.5"
          title="Refresh dashboard data"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 1. Headline Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Positions Card */}
        <Link
          href="/recruiter/job-openings"
          className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-[var(--accent)] hover:bg-[var(--surface-1)] transition-all shadow-xs space-y-2 group"
        >
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[var(--accent)] transition-colors">
              Open Positions
            </span>
            <Briefcase className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.openPositions}
          </div>
          <p className="text-meta text-[11px]">
            Active positions hiring candidates
          </p>
        </Link>

        {/* Active Applications Card */}
        <Link
          href="/recruiter/candidates"
          className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-blue-500 hover:bg-[var(--surface-1)] transition-all shadow-xs space-y-2 group"
        >
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">
              Active Applications
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.activeApplications}
          </div>
          <p className="text-meta text-[11px]">
            Applied, Screening, Interview & Offer
          </p>
        </Link>

        {/* Interviews Scheduled This Week Card */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Interviews This Week
            </span>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.interviewsThisWeek}
          </div>
          <p className="text-meta text-[11px]">
            Scheduled in current week window
          </p>
        </div>

        {/* Hires This Month Card */}
        <Link
          href="/recruiter/candidates/hired"
          className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-emerald-500 hover:bg-[var(--surface-1)] transition-all shadow-xs space-y-2 group"
        >
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-500 transition-colors">
              Hires This Month
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.hiresThisMonth}
          </div>
          <p className="text-meta text-[11px]">
            Moved to Hired stage this month
          </p>
        </Link>
      </div>

      {/* 2. Middle Row: Job Openings Breakdown & Interactive Stage Drill-Down */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Job Opening */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Applications by Job Opening
              </span>
            </div>
            <span className="text-meta text-xs font-semibold">
              Top Open Positions
            </span>
          </div>

          {data.applicationsByJobOpening.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[var(--border-subtle)] rounded-sm">
              <p className="text-xs text-[var(--text-tertiary)]">
                No active open job positions found.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.applicationsByJobOpening}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    stroke="var(--text-tertiary)"
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    stroke="var(--text-tertiary)"
                    fontSize={11}
                    width={110}
                    tickFormatter={(val) =>
                      val.length > 15 ? `${val.substring(0, 15)}...` : val
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-0)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--accent)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Applications by Stage Distribution (Separated Active Pipeline vs Terminal Outcomes) */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Pipeline Breakdown
              </span>
            </div>
            <span className="text-meta text-xs font-semibold">
              Click stage to view candidate list
            </span>
          </div>

          {/* Active Pipeline Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
              Active Pipeline
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {activeStages.map((st) => (
                <Link
                  key={st.stage}
                  href={`/recruiter/candidates?stage=${st.stage}`}
                  className="p-3 rounded-md bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all space-y-1.5 group shadow-xs block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors">
                      {st.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-xl font-extrabold text-[var(--text-primary)]">
                      {st.count}
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Terminal Outcomes Section */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
              Terminal Outcomes
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {outcomeStages.map((st) => {
                const isHired = st.stage === "HIRED";
                const targetHref = isHired
                  ? "/recruiter/candidates/hired"
                  : "/recruiter/candidates/rejected";

                return (
                  <Link
                    key={st.stage}
                    href={targetHref}
                    className={`p-3 rounded-md border transition-all space-y-1.5 group shadow-xs block ${
                      isHired
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500"
                        : "bg-rose-500/10 border-rose-500/30 hover:border-rose-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isHired
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {isHired ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                        <span>{st.label}</span>
                      </span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-all group-hover:translate-x-0.5 ${
                          isHired ? "text-emerald-600" : "text-rose-600"
                        }`}
                      />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div
                        className={`text-xl font-extrabold ${
                          isHired
                            ? "text-emerald-900 dark:text-emerald-100"
                            : "text-rose-900 dark:text-rose-100"
                        }`}
                      >
                        {st.count}
                      </div>
                      <span
                        className={`text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${
                          isHired ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        View →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Applications Received Per Week (Quarterly Trend) */}
      <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Applications Received per Week (Last 12 Weeks)
            </span>
          </div>
          <span className="text-meta text-xs font-semibold">
            Weekly Candidate Volume
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.applicationsPerWeek}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="label"
                stroke="var(--text-tertiary)"
                fontSize={11}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--text-tertiary)"
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-0)",
                  borderColor: "var(--border-subtle)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--accent)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Needs Attention */}
      {(stalledCount > 0 ||
        data.candidatesInOffer > 0 ||
        data.interviewsThisWeek > 0) && (
        <div className="p-5 rounded-md border border-amber-500/30 bg-amber-500/5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
              Needs Attention
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stalledCount > 0 && (
              <Link
                href="/recruiter/alerts"
                className="flex items-center gap-3 p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/15 transition-all group"
              >
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-sm text-amber-900 dark:text-amber-100">
                    {stalledCount}
                  </span>
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-medium ml-1">
                    {stalledCount === 1
                      ? "stalled candidate"
                      : "stalled candidates"}
                  </span>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 truncate">
                    Sitting in same stage &gt;10 days
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {data.candidatesInOffer > 0 && (
              <Link
                href="/recruiter/candidates?stage=OFFER"
                className="flex items-center gap-3 p-3 rounded-sm bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-all group"
              >
                <Briefcase className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {data.candidatesInOffer}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">
                    {data.candidatesInOffer === 1 ? "candidate" : "candidates"}{" "}
                    in Offer
                  </span>
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                    Waiting for hire decision
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] ml-auto shrink-0 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {data.interviewsThisWeek > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-sm bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {data.interviewsThisWeek}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">
                    {data.interviewsThisWeek === 1 ? "interview" : "interviews"}{" "}
                    this week
                  </span>
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                    Scheduled for current week
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Recent Activity */}
      {data.recentActivity && data.recentActivity.length > 0 && (
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Recent Activity
              </span>
            </div>
            <span className="text-meta text-xs font-semibold">
              Last 10 events
            </span>
          </div>

          <div className="space-y-1">
            {data.recentActivity.map((event) => {
              const actorName = event.actor?.name || "Unknown";
              const candidateName =
                event.application?.candidateName || "Unknown Candidate";
              const jobOpeningId = event.application?.jobOpeningId;
              const applicationId = event.application?.id;
              const href =
                jobOpeningId && applicationId
                  ? `/recruiter/job-openings/${jobOpeningId}/applications/${applicationId}`
                  : "#";
              const timeAgo = formatDistanceToNow(new Date(event.createdAt), {
                addSuffix: true,
              });

              let summary = "";
              if (event.type === "CREATED") {
                summary = `created application for ${candidateName}`;
              } else if (event.type === "STAGE_CHANGED") {
                if (event.newStage === "HIRED") {
                  summary = `hired ${candidateName}`;
                } else {
                  summary = `advanced ${candidateName} → ${event.newStage}`;
                }
              } else if (event.type === "REJECTED") {
                summary = `rejected ${candidateName}`;
              } else if (event.type === "REINSTATED") {
                summary = `reinstated ${candidateName} to ${event.newStage}`;
              } else if (event.type === "FEEDBACK_ADDED") {
                summary = `submitted feedback for ${candidateName}`;
              } else if (event.type === "INTERVIEW_SCHEDULED") {
                summary = `scheduled interview for ${candidateName}`;
              } else if (event.type === "INTERVIEW_RESCHEDULED") {
                summary = `rescheduled interview for ${candidateName}`;
              } else if (event.type === "INTERVIEW_CANCELLED") {
                summary = `cancelled interview for ${candidateName}`;
              } else {
                summary = `updated ${candidateName}`;
              }

              const isHireEvent =
                event.type === "STAGE_CHANGED" && event.newStage === "HIRED";
              const isRejectEvent = event.type === "REJECTED";
              const isReinstateEvent = event.type === "REINSTATED";

              return (
                <Link
                  key={event.id}
                  href={href}
                  className="flex items-start gap-3 p-2.5 rounded-sm hover:bg-[var(--surface-1)] transition-colors group"
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      isHireEvent
                        ? "bg-emerald-500"
                        : isRejectEvent
                          ? "bg-rose-500"
                          : isReinstateEvent
                            ? "bg-amber-500"
                            : "bg-[var(--accent)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="font-bold text-[var(--text-primary)]">
                        {actorName}
                      </span>{" "}
                      {summary}
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 mt-0.5 group-hover:text-[var(--text-secondary)] transition-colors">
                    {timeAgo}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
