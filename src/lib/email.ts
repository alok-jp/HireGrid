import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail({
  email,
  role,
  invitationUrl,
}: {
  email: string;
  role: "RECRUITER" | "INTERVIEWER";
  invitationUrl: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "You're invited to Hiring Pipeline",
    html: `
      <h1>You're invited!</h1>

      <p>
        You have been invited to join the Hiring Pipeline
        as a ${role}.
      </p>

      <p>
        <a href="${invitationUrl}">
          Accept invitation
        </a>
      </p>

      <p>
        This invitation expires in 24 hours.
      </p>
    `,
  });
}