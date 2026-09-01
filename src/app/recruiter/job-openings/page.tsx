import Link from "next/link";
import { JobOpeningList } from "@/features/job-openings/job-opening-list";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobOpeningsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8">
      {/* Primary Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Openings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active positions and candidate recruitment requisitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/job-openings/archived"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5")}
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </Link>

          <Link
            href="/recruiter/job-openings/create"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-xs font-semibold gap-1.5")}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Opening
          </Link>
        </div>
      </div>

      <JobOpeningList status="OPEN" />
    </div>
  );
}