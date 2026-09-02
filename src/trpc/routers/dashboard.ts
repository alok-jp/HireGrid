import { prisma } from "@/lib/prisma";
import { recruiterProcedure } from "@/trpc/init";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  format,
} from "date-fns";
import { ApplicationStage, InterviewStatus } from "@/generated/prisma/enums";

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const dashboardRouter = {
  getStats: recruiterProcedure.query(async () => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const quarterStart = subWeeks(currentWeekStart, 11); // 12 weeks rolling trend

    const [
      openPositions,
      activeApplications,
      interviewsThisWeek,
      hiresThisMonth,
      openingsAgg,
      stageGroup,
      quarterApplications,
    ] = await Promise.all([
      // 1. Open Positions Count
      prisma.jobOpening.count({
        where: { status: "OPEN" },
      }),

      // 2. Active Applications Count (APPLIED, SCREENING, INTERVIEW, OFFER)
      prisma.application.count({
        where: {
          stage: {
            in: [
              ApplicationStage.APPLIED,
              ApplicationStage.SCREENING,
              ApplicationStage.INTERVIEW,
              ApplicationStage.OFFER,
            ],
          },
        },
      }),

      // 3. Interviews Scheduled This Week
      prisma.interview.count({
        where: {
          status: InterviewStatus.SCHEDULED,
          scheduledAt: {
            gte: currentWeekStart,
            lte: currentWeekEnd,
          },
        },
      }),

      // 4. Hires This Month
      prisma.application.count({
        where: {
          stage: ApplicationStage.HIRED,
          hiredAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
      }),

      // 5. Applications by Job Opening
      prisma.jobOpening.findMany({
        where: { status: "OPEN" },
        select: {
          id: true,
          title: true,
          department: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // 6. Applications by Stage Aggregation
      prisma.application.groupBy({
        by: ["stage"],
        _count: {
          _all: true,
        },
      }),

      // 7. Applications Received Per Week over previous quarter (createdAt >= quarterStart)
      prisma.application.findMany({
        where: {
          createdAt: {
            gte: quarterStart,
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Format Applications by Job Opening
    const applicationsByJobOpening = openingsAgg.map((o) => ({
      jobOpeningId: o.id,
      title: o.title,
      department: o.department,
      count: o._count.applications,
    }));

    // Format Applications by Stage
    const stageMap = new Map(stageGroup.map((s) => [s.stage, s._count._all]));
    const allStages: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SCREENING,
      ApplicationStage.INTERVIEW,
      ApplicationStage.OFFER,
      ApplicationStage.HIRED,
      ApplicationStage.REJECTED,
    ];

    const applicationsByStage = allStages.map((st) => ({
      stage: st,
      label: STAGE_LABELS[st] || st,
      count: stageMap.get(st) || 0,
    }));

    // Format Applications Received per Week (Rolling 12 Weeks)
    const weeksList: Array<{ weekStart: Date; weekStr: string; label: string; count: number }> = [];
    for (let i = 0; i < 12; i++) {
      const wStart = subWeeks(currentWeekStart, 11 - i);
      const weekStr = format(wStart, "yyyy-MM-dd");
      const label = format(wStart, "MMM d");
      weeksList.push({ weekStart: wStart, weekStr, label, count: 0 });
    }

    quarterApplications.forEach((app) => {
      const appWeekStart = startOfWeek(new Date(app.createdAt), { weekStartsOn: 1 });
      const appWeekStr = format(appWeekStart, "yyyy-MM-dd");
      const weekObj = weeksList.find((w) => w.weekStr === appWeekStr);
      if (weekObj) {
        weekObj.count += 1;
      }
    });

    const applicationsPerWeek = weeksList.map((w) => ({
      week: w.weekStr,
      label: w.label,
      count: w.count,
    }));

    return {
      openPositions,
      activeApplications,
      interviewsThisWeek,
      hiresThisMonth,
      applicationsByJobOpening,
      applicationsByStage,
      applicationsPerWeek,
    };
  }),
};
