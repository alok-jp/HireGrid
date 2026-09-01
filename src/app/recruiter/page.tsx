import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Archive, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecruiterDashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6 sm:p-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Recruiter Workspace</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage open hiring requisitions, review candidate pipelines, and track recruitment progress.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col justify-between border bg-card transition-all hover:border-primary/30 hover:shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Active Openings</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-xs mt-1">
              Inspect active job requisitions and candidate application lists.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Link
              href="/recruiter/job-openings"
              className={cn(buttonVariants({ variant: "default" }), "w-full text-xs font-semibold justify-between")}
            >
              <span>View Openings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border bg-card transition-all hover:border-primary/30 hover:shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Create Position</CardTitle>
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-xs mt-1">
              Post a new job opening with custom department and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Link
              href="/recruiter/job-openings/create"
              className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs justify-between")}
            >
              <span>New Job Opening</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border bg-card transition-all hover:border-primary/30 hover:shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Archived Roles</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs mt-1">
              Review completed positions or restore them back to active recruitment.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Link
              href="/recruiter/job-openings/archived"
              className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs justify-between")}
            >
              <span>View Archived</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
