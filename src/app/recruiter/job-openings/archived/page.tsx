import Link from "next/link";
import { JobOpeningList } from "@/features/job-openings/job-opening-list";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArchivedJobOpeningsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Archived Job Openings
          </h1>
          <p className="text-sm text-muted-foreground">
            View and restore archived job positions.
          </p>
        </div>

        <Link
          href="/recruiter/job-openings"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Open Positions
        </Link>
      </div>

      <JobOpeningList status="ARCHIVED" />
    </div>
  );
}
