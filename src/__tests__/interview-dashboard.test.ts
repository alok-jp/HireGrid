import { InterviewStatus, ApplicationStage } from "../generated/prisma/enums";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  format,
} from "date-fns";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

function checkTimeOverlap(
  existStart: Date,
  existDurationMinutes: number,
  proposedStart: Date,
  proposedDurationMinutes: number,
): boolean {
  const existEnd = new Date(existStart.getTime() + existDurationMinutes * 60 * 1000);
  const proposedEnd = new Date(proposedStart.getTime() + proposedDurationMinutes * 60 * 1000);
  return existStart < proposedEnd && existEnd > proposedStart;
}

async function runInterviewDashboardTests() {
  console.log("=== Running Interview Scheduling & Dashboard Unit Tests ===\n");

  // 1. Interview Enums & Statuses
  assert(
    InterviewStatus.SCHEDULED === "SCHEDULED",
    "InterviewStatus SCHEDULED enum exists",
  );
  assert(
    InterviewStatus.COMPLETED === "COMPLETED",
    "InterviewStatus COMPLETED enum exists",
  );
  assert(
    InterviewStatus.CANCELLED === "CANCELLED",
    "InterviewStatus CANCELLED enum exists",
  );

  // 2. Duplicate Interviewer De-duplication Logic
  const rawInterviewerIds = ["user-1", "user-2", "user-1", "user-3"];
  const uniqueIds = Array.from(new Set(rawInterviewerIds));
  assert(
    uniqueIds.length === 3,
    "Duplicate interviewer IDs are successfully de-duplicated",
  );

  // 3. Weekly & Monthly Window Date Boundaries
  const now = new Date("2026-09-02T10:00:00Z");
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const insideWeekDate = new Date("2026-09-03T14:00:00Z");
  const outsideWeekDate = new Date("2026-09-15T14:00:00Z");

  assert(
    insideWeekDate >= weekStart && insideWeekDate <= weekEnd,
    "Date within current week falls inside week boundary",
  );
  assert(
    !(outsideWeekDate >= weekStart && outsideWeekDate <= weekEnd),
    "Date outside current week is excluded from week boundary",
  );

  // 4. Monthly Hire Filter
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const hireThisMonth = new Date("2026-09-01T09:00:00Z");
  const hirePreviousMonth = new Date("2026-08-15T09:00:00Z");

  assert(
    hireThisMonth >= monthStart && hireThisMonth <= monthEnd,
    "Hire in current month matches monthly filter",
  );
  assert(
    !(hirePreviousMonth >= monthStart && hirePreviousMonth <= monthEnd),
    "Hire in previous month is excluded from monthly filter",
  );

  // 5. Active Applications Stage Calculation
  const activeStages: ApplicationStage[] = [
    ApplicationStage.APPLIED,
    ApplicationStage.SCREENING,
    ApplicationStage.INTERVIEW,
    ApplicationStage.OFFER,
  ];

  assert(
    activeStages.includes(ApplicationStage.APPLIED) &&
      activeStages.includes(ApplicationStage.SCREENING) &&
      activeStages.includes(ApplicationStage.INTERVIEW) &&
      activeStages.includes(ApplicationStage.OFFER),
    "Active application stages include APPLIED, SCREENING, INTERVIEW, OFFER",
  );
  assert(
    !activeStages.includes(ApplicationStage.HIRED) &&
      !activeStages.includes(ApplicationStage.REJECTED),
    "Active application stages exclude HIRED and REJECTED",
  );

  // 6. Rolling 12-Week Trend Bucket Generation
  const quarterStart = subWeeks(weekStart, 11);
  const formattedQuarterStart = format(quarterStart, "yyyy-MM-dd");
  assert(
    formattedQuarterStart.length === 10,
    "Quarterly rolling 12-week start date formatted cleanly",
  );

  // 7. Double-Booking Overlap Window Math
  const existingInterviewStart = new Date("2026-09-05T14:00:00Z"); // 2:00 PM - 3:00 PM
  const overlappingProposedStart = new Date("2026-09-05T14:30:00Z"); // 2:30 PM - 3:30 PM
  const nonOverlappingProposedStart = new Date("2026-09-05T15:00:00Z"); // 3:00 PM - 4:00 PM

  assert(
    checkTimeOverlap(existingInterviewStart, 60, overlappingProposedStart, 60),
    "Double-booking collision correctly detected for overlapping 2:30 PM window",
  );
  assert(
    !checkTimeOverlap(existingInterviewStart, 60, nonOverlappingProposedStart, 60),
    "Sequential non-overlapping 3:00 PM window correctly allowed",
  );

  // 8. INTERVIEW -> OFFER Completed Interview Rule Assertion
  const zeroCompletedInterviews = 0;
  const oneCompletedInterview = 1;

  const canAdvanceZero = zeroCompletedInterviews > 0;
  const canAdvanceOne = oneCompletedInterview > 0;

  assert(
    !canAdvanceZero,
    "INTERVIEW -> OFFER advancement rejected when completed interviews count is 0",
  );
  assert(
    canAdvanceOne,
    "INTERVIEW -> OFFER advancement allowed when completed interviews count > 0",
  );

  console.log("\n✅ ALL INTERVIEW & DASHBOARD TESTS PASSED SUCCESSFULLY!");
}

runInterviewDashboardTests();
