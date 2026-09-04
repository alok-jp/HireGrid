import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getCurrentSession } from "@/lib/get-session";

export default async function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  // Allow INTERVIEWER and MASTER_ADMIN roles
  if (
    session.user.role !== "INTERVIEWER" &&
    session.user.role !== "MASTER_ADMIN"
  ) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-enter">
      <AppHeader
        navRole="interviewer"
        user={{
          name: session.user.name ?? "",
          email: session.user.email,
          role: session.user.role,
        }}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
