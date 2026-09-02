import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";
import { AppHeader } from "@/components/layout/app-header";

export default async function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "INTERVIEWER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-enter">
      <AppHeader
        role="interviewer"
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
