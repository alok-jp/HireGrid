"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Archive, RotateCcw, Building2, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface JobOpeningListProps {
  status?: "OPEN" | "ARCHIVED";
}

export function JobOpeningList({ status = "OPEN" }: JobOpeningListProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.jobOpening.list.useQuery({ status });

  const archiveMutation = trpc.jobOpening.archive.useMutation({
    onSuccess: () => {
      toast.success("Job opening archived successfully.");
      utils.jobOpening.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive job opening.");
    },
  });

  const restoreMutation = trpc.jobOpening.restore.useMutation({
    onSuccess: () => {
      toast.success("Job opening restored successfully.");
      utils.jobOpening.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore job opening.");
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="flex flex-col justify-between">
            <CardHeader>
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[220px] flex-col items-center justify-center text-center p-8">
          <p className="text-base font-semibold">
            {status === "OPEN"
              ? "No open job openings found."
              : "No archived job openings found."}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {status === "OPEN"
              ? "Create a new job opening to start accepting candidate applications."
              : "Job openings that you archive will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((job) => {
        const isActionPending =
          archiveMutation.isPending || restoreMutation.isPending;

        return (
          <Card
            key={job.id}
            className={`flex flex-col justify-between transition-shadow hover:shadow-md ${
              job.status === "ARCHIVED" ? "bg-muted/30 opacity-80" : ""
            }`}
          >
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-bold line-clamp-1">
                  {job.title}
                </CardTitle>
                <Badge
                  variant={job.status === "OPEN" ? "default" : "secondary"}
                  className="shrink-0 font-semibold"
                >
                  {job.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>{job.department}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {job.description}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <span>
                  {job._count?.applications ?? 0} application(s)
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href={`/recruiter/job-openings/${job.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1 text-xs",
                  )}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>

                {job.status === "OPEN" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActionPending}
                    onClick={() => archiveMutation.mutate({ id: job.id })}
                    className="flex-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {archiveMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Archive className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Archive
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActionPending}
                    onClick={() => restoreMutation.mutate({ id: job.id })}
                    className="flex-1 text-xs"
                  >
                    {restoreMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Restore
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}