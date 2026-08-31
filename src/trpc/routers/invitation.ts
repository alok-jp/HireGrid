import { adminProcedure } from "../init";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";

const createInvitationSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["INTERVIEWER", "RECRUITER"]),
});

export const invitationRouter = {
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      const token = crypto.randomBytes(32).toString("hex");

      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.invitation.create({
        data: {
          email: input.email,
          role: input.role,
          tokenHash,
          expiresAt,
          invitedById: ctx.session.user.id,
        },
      });

      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

      await sendInvitationEmail({
        email: input.email,
        role: input.role,
        invitationUrl,
      });

      return {
        success: true,
        invitationUrl,
        expiresAt,
      };
    }),
};
