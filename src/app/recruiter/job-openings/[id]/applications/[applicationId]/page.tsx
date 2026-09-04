import { CandidateDetailWorkspace } from "@/features/applications/candidate-detail-workspace";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { applicationId } = await params;

  return <CandidateDetailWorkspace applicationId={applicationId} />;
}
