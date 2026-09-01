import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";
import { LogoutButton } from "@/features/auth/logout-button";
import { Briefcase, Archive, LayoutDashboard } from "lucide-react";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "RECRUITER" &&
    session.user.role !== "MASTER_ADMIN"
  ) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Recruiter Navigation Bar */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/recruiter"
              className="flex items-center gap-2 font-bold text-lg text-primary"
            >
              <Briefcase className="h-5 w-5" />
              <span>Hiring Pipeline</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/recruiter"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/recruiter/job-openings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                <span>Job Openings</span>
              </Link>

              <Link
                href="/recruiter/job-openings/archived"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Archived</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Logged in as <strong className="text-foreground">{session.user.name || session.user.email}</strong> ({session.user.role})
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
