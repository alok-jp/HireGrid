import { getCurrentSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { InterviewerCandidateWorkspace } from "@/features/applications/interviewer-candidate-workspace";

interface InterviewerApplicationPageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function InterviewerApplicationPage({
  params,
}: InterviewerApplicationPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "INTERVIEWER" && session.user.role !== "MASTER_ADMIN") {
    redirect("/");
  }

  const { applicationId } = await params;

  return <InterviewerCandidateWorkspace applicationId={applicationId} />;
}
