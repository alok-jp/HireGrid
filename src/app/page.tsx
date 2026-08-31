import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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