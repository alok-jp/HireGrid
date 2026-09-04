import { prisma } from "@/lib/prisma";
import { masterAdminProcedure, recruiterProcedure, router } from "@/trpc/init";

export const userRouter = router({
  getInterviewers: recruiterProcedure.query(async () => {
    const interviewers = await prisma.user.findMany({
      where: {
        role: "INTERVIEWER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return interviewers;
  }),

  getTeamMembers: masterAdminProcedure.query(async () => {
    const recruiters = await prisma.user.findMany({
      where: { role: "RECRUITER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const interviewers = await prisma.user.findMany({
      where: { role: "INTERVIEWER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { recruiters, interviewers };
  }),
});
