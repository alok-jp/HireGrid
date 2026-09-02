import { router, recruiterProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const userRouter = router({
  getInterviewers: recruiterProcedure.query(async () => {
    const interviewers = await prisma.user.findMany({
      where: {
        role: "INTERVIEWER",
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
});
