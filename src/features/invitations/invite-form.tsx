"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inviteSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["INTERVIEWER", "RECRUITER"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteForm() {
  const createInvitation = trpc.invitation.create.useMutation();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "RECRUITER",
    },
  });

  const onSubmit = (values: InviteFormValues) => {
    createInvitation.mutate(values, {
      onSuccess: () => {
        toast.success("Invitation sent successfully!");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send invitation");
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="recruiter@example.com"
                  disabled={createInvitation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={createInvitation.isPending}
                  className="w-full rounded-md border p-2 bg-background"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="INTERVIEWER">Interviewer</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full font-medium"
          disabled={createInvitation.isPending}
        >
          {createInvitation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending invitation...
            </>
          ) : (
            "Send Invitation"
          )}
        </Button>
      </form>
    </Form>
  );
}