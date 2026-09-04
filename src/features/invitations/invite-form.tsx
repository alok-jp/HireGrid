"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PermissionInfo } from "@/components/admin/permission-info";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
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

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
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
                  className="w-full rounded-md border p-2 bg-background text-sm font-medium"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="INTERVIEWER">Interviewer</option>
                </select>
              </FormControl>
              <PermissionInfo role={selectedRole || "RECRUITER"} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full btn-primary font-medium"
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
