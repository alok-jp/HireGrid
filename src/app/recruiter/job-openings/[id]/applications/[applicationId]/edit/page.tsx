import { notFound } from "next/navigation";
import { ApplicationForm } from "@/features/applications/application-form";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id, applicationId } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let application:
    | Awaited<ReturnType<typeof caller.application.getById>>
    | undefined;

  try {
    application = await caller.application.getById({ id: applicationId });
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <ApplicationForm jobOpeningId={id} application={application} />
    </div>
  );
}
