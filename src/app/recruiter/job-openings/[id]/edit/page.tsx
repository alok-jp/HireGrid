import { notFound } from "next/navigation";
import { JobOpeningForm } from "@/features/job-openings/job-opening-form";
import { createCaller } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/context";

export default async function EditJobOpeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  let jobOpening;

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