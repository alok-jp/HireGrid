import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { z } from "zod";
import { sendInvitationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { adminProcedure, publicProcedure } from "../init";

const createInvitationSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["INTERVIEWER", "RECRUITER"]),
});

export const invitationRouter = {
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A user with this email address already exists.",
        });
      }

      await prisma.invitation.deleteMany({
        where: { email: input.email },
      });

      const token = crypto.randomBytes(32).toString("hex");

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

      console.log(invitationUrl);

      
      try {
        await sendInvitationEmail({
          email: input.email,
          role: input.role,
          invitationUrl,
        });
      } catch (error) {
        console.error("Failed to send invitation email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to send invitation email. Please check your SMTP configuration.",
        });
      }

      // Only create DB record AFTER email has been sent successfully
      await prisma.invitation.create({
        data: {
          email: input.email,
          role: input.role,
          tokenHash,
          expiresAt,
          invitedById: ctx.session.user.id,
        },
      });

      return {
        success: true,
        invitationUrl,
        expiresAt,
      };
    }),

  getByToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
      }),
    )
    .query(async ({ input }) => {
      const tokenHash = crypto
        .createHash("sha256")
        .update(input.token)
        .digest("hex");

      const invitation = await prisma.invitation.findUnique({
        where: {
          tokenHash,
        },
      });

      if (!invitation) {
        return {
          valid: false,
          reason: "TOKEN_NOT_FOUND",
        };
      }

      if (invitation.usedAt) {
        return {
          valid: false,
          reason: "ALREADY_USED",
        };
      }

      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        return {
          valid: false,
          reason: "EXPIRED",
        };
      }

      return {
        valid: true,
        invitation,
        expiresAt: invitation.expiresAt,
      };
    }),
};
