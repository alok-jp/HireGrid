import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();

  // Fetch team lists and headline metrics for Master Admin overview
  const [
    totalUsers,
    activeRecruiters,
    activeInterviewers,
    totalOpenings,
    totalApplications,
    pendingInvites,
    recruiters,
    interviewers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "RECRUITER", isActive: true } }),
    prisma.user.count({ where: { role: "INTERVIEWER", isActive: true } }),
    prisma.jobOpening.count({ where: { status: "OPEN" } }),
    prisma.application.count(),
    prisma.invitation.count({ where: { usedAt: null } }),
    prisma.user.findMany({
      where: { role: "RECRUITER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "INTERVIEWER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto space-y-8 p-6 sm:p-8 max-w-6xl">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border-subtle) pb-6">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">
            Admin Overview
          </h1>
          <p className="text-meta mt-1">
            System administration, team member directory & invitation management
            for {session?.user.email}
          </p>
        </div>

        <Link
          href="/admin/invitations"
          className="btn-primary inline-flex items-center gap-2 font-semibold shadow-xs hover:shadow-sm shrink-0 text-xs px-4 py-2 rounded-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </Link>
      </div>

      {/* Section 1: Active Team Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Recruiters
            </span>
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {activeRecruiters}
          </div>
          <p className="text-meta text-[11px]">Enabled recruiter accounts</p>
        </div>

        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Interviewers
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {activeInterviewers}
          </div>
          <p className="text-meta text-[11px]">Enabled interviewer accounts</p>
        </div>

        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Open Positions
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold">
              Active
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {totalOpenings}
          </div>
          <p className="text-meta text-[11px]">Live hiring openings</p>
        </div>

        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Candidates
            </span>
            <span className="text-xs font-mono text-[var(--accent)] font-bold">
              Pipeline
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {totalApplications}
          </div>
          <p className="text-meta text-[11px]">Applications submitted</p>
        </div>
      </div>

      {/* Section 2: Inline Quick Metrics & Invites Link */}
      <div className="flex flex-wrap items-center py-4 px-2 bg-[var(--surface-0)] rounded-md border border-[var(--border-subtle)] justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-display font-bold text-xl">{totalUsers}</span>
            <span className="text-meta text-xs">Total Registered Accounts</span>
          </div>

          <div className="w-[1px] h-8 bg-[var(--border-subtle)]" />

          <div className="flex flex-col gap-0.5">
            <span className="text-display font-bold text-xl">
              {pendingInvites}
            </span>
            <span className="text-meta text-xs">Pending Invitations</span>
          </div>
        </div>

        <Link
          href="/admin/invitations"
          className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[var(--surface-1)] hover:bg-[var(--accent-soft)] transition-all text-xs font-semibold text-[var(--accent)]"
        >
          <span>Manage Team Invitations</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Section 3: Team Directories (Recruiters & Interviewers Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruiters Directory */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Recruiters ({recruiters.length})
              </h2>
            </div>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Hiring Managers
            </span>
          </div>

          {recruiters.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
              No recruiter accounts registered.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)] uppercase text-[10px] font-bold">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {recruiters.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--surface-1)] transition-colors"
                    >
                      <td className="py-2.5 font-bold text-[var(--text-primary)]">
                        {user.name}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                          {user.email}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-[11px] text-[var(--text-tertiary)]">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interviewers Directory */}
        <div className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Interviewers ({interviewers.length})
              </h2>
            </div>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Panel Evaluators
            </span>
          </div>

          {interviewers.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
              No interviewer accounts registered.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)] uppercase text-[10px] font-bold">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {interviewers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--surface-1)] transition-colors"
                    >
                      <td className="py-2.5 font-bold text-[var(--text-primary)]">
                        {user.name}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                          {user.email}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Active
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-[11px] text-[var(--text-tertiary)]">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
