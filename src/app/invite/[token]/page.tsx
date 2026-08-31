import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTRPCContext } from "@/trpc/context";
import { createCaller } from "@/trpc/routers/_app";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ctx = await createTRPCContext();
  const caller = createCaller(ctx);

  const result = await caller.invitation.getByToken({ token });

  if (!result.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 md:p-8">
        <Card className="w-full max-w-md shadow-lg border-destructive/40">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive">
              Invalid or Expired Invitation
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {result.reason === "EXPIRED"
                ? "This invitation link has expired. Please ask your administrator for a new invitation."
                : result.reason === "ALREADY_USED"
                  ? "This invitation has already been accepted and used."
                  : "This invitation link is invalid or does not exist."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invitation = result.invitation!;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            You're Invited!
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            You have been invited to join the hiring pipeline.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2 border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Invited Email:
              </span>
              <span className="font-semibold text-foreground">
                {invitation.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Role:</span>
              <Badge variant="outline" className="font-semibold">
                {invitation.role}
              </Badge>
            </div>
            {invitation.expiresAt && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Expires:
                </span>
                <span>
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 text-center space-y-3">
            <Link
              href={`/signup?email=${encodeURIComponent(invitation.email)}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Accept Invitation & Create Account
            </Link>
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 text-primary font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
