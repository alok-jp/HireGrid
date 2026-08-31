import { InviteForm } from "@/features/invitations/invite-form";

export default function InvitationsPage() {
  return (
    <main className="min-h-screen bg-muted/40 p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">
              Invite team member
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Invite a recruiter or interviewer to join the
              hiring pipeline.
            </p>
          </div>

          <InviteForm />
        </div>
      </div>
    </main>
  );
}