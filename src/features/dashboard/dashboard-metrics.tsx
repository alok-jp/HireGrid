"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  CalendarDays,
  UserCheck,
  Building2,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export function DashboardMetrics() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    trpc.dashboard.getStats.useQuery(undefined, {
      staleTime: 10000,
    });

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
        <p className="text-meta">{error?.message || "Something went wrong loading stats."}</p>
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

  return (
    <div className="space-y-6">
      {/* Top Refetch Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">
            Recruiter Pipeline Dashboard
          </h1>
          <p className="text-meta mt-0.5">
            Headline metrics, active interviews, and quarterly pipeline volume trends.
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
          <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 1. Headline Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Positions Card */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Open Positions
            </span>
            <Briefcase className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.openPositions}
          </div>
          <p className="text-meta text-[11px]">Active positions hiring candidates</p>
        </div>

        {/* Active Applications Card */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Applications
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.activeApplications}
          </div>
          <p className="text-meta text-[11px]">Applied, Screening, Interview & Offer</p>
        </div>

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
          <p className="text-meta text-[11px]">Scheduled in current week window</p>
        </div>

        {/* Hires This Month Card */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Hires This Month
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {data.hiresThisMonth}
          </div>
          <p className="text-meta text-[11px]">Moved to Hired stage this month</p>
        </div>
      </div>

      {/* 2. Middle Row: Job Openings Breakdown & Stage Distribution */}
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
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.applicationsByJobOpening}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" allowDecimals={false} stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    stroke="var(--text-tertiary)"
                    fontSize={11}
                    width={110}
                    tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 15)}...` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-0)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Applications by Stage Distribution */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Applications by Stage
              </span>
            </div>
            <span className="text-meta text-xs font-semibold">
              Pipeline Breakdown
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {data.applicationsByStage.map((st) => (
              <div
                key={st.stage}
                className="p-3 rounded-md bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                  {st.label}
                </span>
                <div className="text-xl font-extrabold text-[var(--text-primary)]">
                  {st.count}
                </div>
              </div>
            ))}
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
            <LineChart data={data.applicationsPerWeek} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis allowDecimals={false} stroke="var(--text-tertiary)" fontSize={11} />
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
    </div>
  );
}
