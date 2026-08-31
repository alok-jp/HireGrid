import { redirect } from "next/navigation";
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

  if (session.user.role !== "INTERVIEWER") {
    redirect("/");
  }

  return <>{children}</>;
}
