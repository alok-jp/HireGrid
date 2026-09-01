import { prismaAdapter } from "@better-auth/prisma-adapter";
import { APIError, betterAuth } from "better-auth";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Add trustedOrigins here
  trustedOrigins: [
    "https://hiregrid-phi.vercel.app",
    "http://localhost:3000",
  ],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Allow seeding master admin if ADMIN_EMAIL matches (case-insensitive)
          if (
            process.env.ADMIN_EMAIL &&
            user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
          ) {
            return {
              data: {
                ...user,
                role: "MASTER_ADMIN",
              },
            };
          }

          const invitation = await prisma.invitation.findFirst({
            where: {
              email: {
                equals: user.email,
                mode: "insensitive",
              },
              usedAt: null,
              expiresAt: {
                gt: new Date(),
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          if (!invitation) {
            throw new APIError("BAD_REQUEST", {
              message:
                "Registration is invite-only. You must be invited by an administrator to create an account.",
            });
          }

          await prisma.invitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() },
          });

          return {
            data: {
              ...user,
              role: invitation.role,
            },
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "INTERVIEWER",
        input: false,
      },
    },
  },
});