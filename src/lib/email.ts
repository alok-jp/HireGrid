import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP configuration is missing. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions) {
  const defaultFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;
  const sender = from || defaultFrom;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (error) {
    console.error(
      "Failed to send email via SMTP:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

export async function sendInvitationEmail({
  email,
  role,
  invitationUrl,
}: {
  email: string;
  role: "RECRUITER" | "INTERVIEWER";
  invitationUrl: string;
}) {
  const subject = "You're invited to Hiring Pipeline";
  const html = `
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
    `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
