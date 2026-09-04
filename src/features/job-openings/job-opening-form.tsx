"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

const jobOpeningSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type JobOpeningFormValues = z.infer<typeof jobOpeningSchema>;

interface JobOpeningFormProps {
  jobOpening?: {
    id: string;
    title: string;
    department: string;
    description: string;
  };
}

export function JobOpeningForm({ jobOpening }: JobOpeningFormProps) {
  const router = useRouter();
  const isEditing = !!jobOpening;

  const form = useForm<JobOpeningFormValues>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: {
      title: jobOpening?.title ?? "",
      department: jobOpening?.department ?? "",
      description: jobOpening?.description ?? "",
    },
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.jobOpening.create.useMutation({
    onSuccess: () => {
      toast.success("Job opening created successfully.");
      utils.jobOpening.list.invalidate();
      router.push("/recruiter/job-openings");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job opening.");
    },
  });

  const updateMutation = trpc.jobOpening.update.useMutation({
    onSuccess: () => {
      toast.success("Job opening updated successfully.");
      utils.jobOpening.list.invalidate();
      if (jobOpening?.id) {
        utils.jobOpening.getById.invalidate({ id: jobOpening.id });
      }
      router.push("/recruiter/job-openings");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job opening.");
    },
  });

  const onSubmit = async (values: JobOpeningFormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: jobOpening.id,
        ...values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Job Opening" : "Create Job Opening"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Senior Backend Engineer"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Engineering"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the responsibilities, requirements, and scope of this role..."
                      className="min-h-37.5"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Job Opening"
                    : "Create Job Opening"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
