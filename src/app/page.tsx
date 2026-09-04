import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "MASTER_ADMIN") {
    redirect("/admin");
  } else if (role === "RECRUITER") {
    redirect("/recruiter");
  } else if (role === "INTERVIEWER") {
    redirect("/interviewer");
  } else {
    redirect("/login");
  }
}
