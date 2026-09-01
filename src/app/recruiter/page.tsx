import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Archive, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecruiterDashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your recruitment management portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Open Job Positions</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              View, edit, and manage all active job openings and candidate pipelines.
            </CardDescription>
            <Link
              href="/recruiter/job-openings"
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              Manage Job Openings
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Create New Opening</CardTitle>
            <Plus className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Post a new job position with custom department, title, and description.
            </CardDescription>
            <Link
              href="/recruiter/job-openings/create"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Create Opening
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Archived Openings</CardTitle>
            <Archive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Review archived positions or restore them back to active recruitment.
            </CardDescription>
            <Link
              href="/recruiter/job-openings/archived"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              View Archived Jobs
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
