import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "MASTER_ADMIN":
      redirect("/admin");

    case "RECRUITER":
      redirect("/recruiter");

    case "INTERVIEWER":
      redirect("/interviewer");

    default:
      redirect("/login");
  }
}