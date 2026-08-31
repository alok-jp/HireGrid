import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/");
  }

  return <>{children}</>;
}
