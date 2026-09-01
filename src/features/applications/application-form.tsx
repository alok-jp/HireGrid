"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const applicationSchema = z.object({
  candidateName: z.string().min(2, "Candidate name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobOpeningId: string;
  application?: {
    id: string;
    candidateName: string;
    email: string;
    source: string;
    notes?: string | null;
  };
}

export function ApplicationForm({ jobOpeningId, application }: ApplicationFormProps) {
  const router = useRouter();
  const isEditing = !!application;

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      candidateName: application?.candidateName ?? "",
      email: application?.email ?? "",
      source: application?.source ?? "LinkedIn",
      notes: application?.notes ?? "",
    },
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.application.create.useMutation({
    onSuccess: () => {
      toast.success("Candidate application created successfully.");
      utils.application.getByJobOpeningId.invalidate({ jobOpeningId });
      router.push(`/recruiter/job-openings/${jobOpeningId}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create application.");
    },
  });

  const updateMutation = trpc.application.update.useMutation({
    onSuccess: () => {
      toast.success("Candidate application updated successfully.");
      utils.application.getByJobOpeningId.invalidate({ jobOpeningId });
      if (application?.id) {
        utils.application.getById.invalidate({ id: application.id });
      }
      router.push(`/recruiter/job-openings/${jobOpeningId}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update application.");
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: application.id,
        ...values,
      });
    } else {
      await createMutation.mutateAsync({
        jobOpeningId,
        ...values,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Application" : "Add New Application"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="candidateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Jane Doe"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g. jane.doe@example.com"
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
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Source</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. LinkedIn, Referral, Career Site, Indeed"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add candidate background notes, initial interview observations, or referral details..."
                      className="min-h-[120px]"
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
                    : "Adding..."
                  : isEditing
                    ? "Update Application"
                    : "Add Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
