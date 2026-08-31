"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Button } from "@/components/ui/button";

const inviteSchema = z.object({
    email: z.email("Please enter a valid email"),
    role: z.enum(["INTERVIEWER", "RECRUITER"]),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export function InviteForm() {
    const createInvitation =
        trpc.invitation.create.useMutation();

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
                form.reset();
            },

            onError: (error) => {
                console.error(error);
            },
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
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
                                    className="w-full rounded-md border p-2"
                                >
                                    <option value="RECRUITER">
                                        Recruiter
                                    </option>

                                    <option value="INTERVIEWER">
                                        Interviewer
                                    </option>
                                </select>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={createInvitation.isPending}
                >
                    {createInvitation.isPending
                        ? "Sending..."
                        : "Send Invitation"}
                </Button>
            </form>
        </Form>
    );
}