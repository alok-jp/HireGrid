import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const invitation = await prisma.invitation.findFirst({
            where: {
              email: user.email,
              usedAt: null,
              expiresAt: {
                gt: new Date(),
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          if (invitation) {
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
          }

          return {
            data: {
              ...user,
              role: user.role || "INTERVIEWER",
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