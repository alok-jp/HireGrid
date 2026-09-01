import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recruiterProcedure } from "@/trpc/init";

const createApplicationSchema = z.object({
  jobOpeningId: z.string().min(1, "Job opening ID is required"),
  candidateName: z.string().min(2, "Candidate name is required"),
  email: z.string().email("Invalid candidate email address"),
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

const updateApplicationSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  candidateName: z.string().min(2, "Candidate name is required"),
  email: z.string().email("Invalid candidate email address"),
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

export const applicationRouter = {
  create: recruiterProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.findUnique({
        where: { id: input.jobOpeningId },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      const application = await prisma.application.create({
        data: {
          jobOpeningId: input.jobOpeningId,
          candidateName: input.candidateName,
          email: input.email,
          source: input.source,
          notes: input.notes ?? "",
          stage: "Applied",
        },
      });

      return application;
    }),

  update: recruiterProcedure
    .input(updateApplicationSchema)
    .mutation(async ({ input }) => {
      const existing = await prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const application = await prisma.application.update({
        where: { id: input.id },
        data: {
          candidateName: input.candidateName,
          email: input.email,
          source: input.source,
          notes: input.notes ?? "",
        },
      });

      return application;
    }),

  getByJobOpeningId: recruiterProcedure
    .input(
      z.object({
        jobOpeningId: z.string().min(1, "Job opening ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const applications = await prisma.application.findMany({
        where: { jobOpeningId: input.jobOpeningId },
        orderBy: { createdAt: "desc" },
      });

      return applications;
    }),

  getById: recruiterProcedure
    .input(
      z.object({
        id: z.string().min(1, "Application ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          jobOpening: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return application;
    }),
};
