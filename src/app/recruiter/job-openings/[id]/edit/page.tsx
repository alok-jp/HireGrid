import { notFound } from "next/navigation";
import { JobOpeningForm } from "@/features/job-openings/job-opening-form";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function EditJobOpeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let jobOpening:
    | Awaited<ReturnType<typeof caller.jobOpening.getById>>
    | undefined;

  try {
    jobOpening = await caller.jobOpening.getById({ id });
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <JobOpeningForm jobOpening={jobOpening} />
    </div>
  );
}
