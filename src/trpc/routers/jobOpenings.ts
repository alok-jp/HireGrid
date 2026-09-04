import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recruiterProcedure } from "@/trpc/init";

const createJobOpeningSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
});

const updateJobOpeningSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
});

export const jobOpeningRouter = {
  list: recruiterProcedure
    .input(
      z
        .object({
          status: z
            .enum(["OPEN", "ARCHIVED", "ALL"])
            .optional()
            .default("OPEN"),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const statusFilter = input?.status ?? "OPEN";
      const jobOpenings = await prisma.jobOpening.findMany({
        where:
          statusFilter === "ALL"
            ? {}
            : {
                status: statusFilter,
              },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });
      return jobOpenings;
    }),

  getById: recruiterProcedure
    .input(z.object({ id: z.string().min(1, "ID is required") }))
    .query(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.findUnique({
        where: { id: input.id },
        include: {
          applications: true,
        },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      return jobOpening;
    }),

  create: recruiterProcedure
    .input(createJobOpeningSchema)
    .mutation(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.create({
        data: {
          title: input.title,
          department: input.department,
          description: input.description,
          status: "OPEN",
        },
      });

      return jobOpening;
    }),

  update: recruiterProcedure
    .input(updateJobOpeningSchema)
    .mutation(async ({ input }) => {
      const existing = await prisma.jobOpening.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      const jobOpening = await prisma.jobOpening.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          department: input.department,
          description: input.description,
        },
      });

      return jobOpening;
    }),

  archive: recruiterProcedure
    .input(
      z.object({
        id: z.string().min(1, "Job ID is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      if (jobOpening.status === "ARCHIVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job opening is already archived",
        });
      }

      const updatedJob = await prisma.jobOpening.update({
        where: {
          id: jobOpening.id,
        },
        data: {
          status: "ARCHIVED",
        },
      });

      return updatedJob;
    }),

  restore: recruiterProcedure
    .input(
      z.object({
        id: z.string().min(1, "Job opening ID is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const jobOpening = await prisma.jobOpening.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      if (jobOpening.status === "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job opening is already open",
        });
      }

      const updatedJobOpening = await prisma.jobOpening.update({
        where: {
          id: input.id,
        },
        data: {
          status: "OPEN",
        },
      });

      return updatedJobOpening;
    }),
};
