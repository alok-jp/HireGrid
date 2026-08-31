import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/get-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "MASTER_ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
