import Link from "next/link";
import { JobOpeningList } from "@/features/job-openings/job-opening-list";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobOpeningsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Openings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your open positions and job requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/job-openings/archived"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archived Openings
          </Link>

          <Link
            href="/recruiter/job-openings/create"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Opening
          </Link>
        </div>
      </div>

      <JobOpeningList status="OPEN" />
    </div>
  );
}