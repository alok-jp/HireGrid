import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InviteForm } from "@/features/invitations/invite-form";

export default function InvitationsPage() {
  return (
    <div className="container mx-auto max-w-xl space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Admin Dashboard
        </Link>
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h1 className="text-title">Invite Team Member</h1>
          <p className="text-meta mt-1">
            Send an email invitation link to onboard recruiters or interviewers.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-xs">
        <InviteForm />
      </div>
    </div>
  );
}
