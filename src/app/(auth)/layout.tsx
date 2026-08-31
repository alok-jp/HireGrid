import { redirect } from "next/navigation";
import { AuthLayout } from "@/features/auth/auth-layout";
import { getCurrentSession } from "@/lib/get-session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return <AuthLayout>{children}</AuthLayout>;
}
