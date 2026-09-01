import { ApplicationForm } from "@/features/applications/application-form";

export default async function CreateApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <ApplicationForm jobOpeningId={id} />
    </div>
  );
}
