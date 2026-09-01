import Link from "next/link";
import { getCurrentSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { UserPlus, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();

  // Fetch metrics for Master Admin overview
  const [totalUsers, totalOpenings, totalApplications, pendingInvites] =
    await Promise.all([
      prisma.user.count(),
      prisma.jobOpening.count({ where: { status: "OPEN" } }),
      prisma.application.count(),
      prisma.invitation.count({ where: { usedAt: null } }),
    ]);

  return (
    <div className="container mx-auto space-y-8 p-6 sm:p-8 max-w-5xl">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-display text-[var(--text-primary)]">
            Admin Overview
          </h1>
          <p className="text-meta mt-1">
            System administration & team access control for {session?.user.email}
          </p>
        </div>

        <Link
          href="/admin/invitations"
          className="btn-primary inline-flex items-center gap-2 font-semibold shadow-xs hover:shadow-sm shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </Link>
      </div>

      {/* Section 5: Stat Row (Inline Typography Metrics, No Borders) */}
      <div className="flex flex-wrap items-center py-6 px-2">
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-display font-semibold">{totalUsers}</span>
          <span className="text-meta">Total users</span>
        </div>

        <div className="w-[1px] h-8 bg-[var(--border-subtle)]" />

        <div className="flex flex-col gap-1 px-8">
          <span className="text-display font-semibold">{totalOpenings}</span>
          <span className="text-meta">Active positions</span>
        </div>

        <div className="w-[1px] h-8 bg-[var(--border-subtle)]" />

        <div className="flex flex-col gap-1 px-8">
          <span className="text-display font-semibold">{totalApplications}</span>
          <span className="text-meta">Candidates</span>
        </div>

        <div className="w-[1px] h-8 bg-[var(--border-subtle)]" />

        {/* Actionable metric gets surface treatment */}
        <Link
          href="/admin/invitations"
          className="flex flex-col gap-1 ml-4 px-5 py-3 rounded-[var(--radius-md)] bg-[var(--surface-1)] hover:bg-[var(--accent-soft)] transition-all transform hover:-translate-y-0.5"
        >
          <span
            className="text-display font-semibold"
            style={{
              color: pendingInvites > 0 ? "var(--status-pending)" : "var(--text-primary)",
            }}
          >
            {pendingInvites}
          </span>
          <span className="text-meta font-semibold flex items-center gap-1">
            Pending invites {pendingInvites > 0 && <ArrowRight className="h-3.5 w-3.5" />}
          </span>
        </Link>
      </div>
    </div>
  );
}
