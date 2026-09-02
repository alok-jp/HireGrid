import {
  getNextStage,
  canAdvance,
  canReject,
  canReinstate,
} from "../lib/application-stage";
import { ApplicationStage } from "../generated/prisma/enums";
import {
  canViewApplication,
  canEditApplication,
  canAdvanceApplication,
  canRejectApplication,
  canReinstateApplication,
  canAssignInterviewer,
  canExportApplications,
  canSubmitFeedback,
} from "../lib/policy";
import { escapeCsvCell, generateApplicationsCsv } from "../lib/csv-exporter";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

async function runTests() {
  console.log("=== Running Business-Rule & Policy Unit Tests ===\n");

  // 1. Pipeline Stage Rules
  assert(
    getNextStage(ApplicationStage.APPLIED) === ApplicationStage.SCREENING,
    "APPLIED advances to SCREENING",
  );
  assert(
    getNextStage(ApplicationStage.SCREENING) === ApplicationStage.INTERVIEW,
    "SCREENING advances to INTERVIEW",
  );
  assert(
    getNextStage(ApplicationStage.INTERVIEW) === ApplicationStage.OFFER,
    "INTERVIEW advances to OFFER",
  );
  assert(
    getNextStage(ApplicationStage.OFFER) === ApplicationStage.HIRED,
    "OFFER advances to HIRED",
  );
  assert(
    getNextStage(ApplicationStage.HIRED) === null,
    "HIRED cannot be advanced further",
  );
  assert(
    getNextStage(ApplicationStage.REJECTED) === null,
    "REJECTED cannot be advanced",
  );
  assert(
    canReject(ApplicationStage.APPLIED) === true,
    "APPLIED application can be rejected",
  );
  assert(
    canReject(ApplicationStage.REJECTED) === false,
    "REJECTED application cannot be re-rejected",
  );
  assert(
    canReinstate(ApplicationStage.REJECTED) === true,
    "REJECTED application can be reinstated",
  );
  assert(
    canReinstate(ApplicationStage.INTERVIEW) === false,
    "Non-rejected application cannot be reinstated",
  );

  // 2. Policy Authorization Layer
  const recruiter = {
    id: "rec-1",
    email: "recruiter@example.com",
    role: "RECRUITER",
  };
  const interviewer = {
    id: "int-1",
    email: "interviewer@example.com",
    role: "INTERVIEWER",
  };
  const assignedApp = {
    id: "app-1",
    jobOpeningId: "job-1",
    interviewers: [{ interviewerId: "int-1" }],
  };
  const unassignedApp = {
    id: "app-2",
    jobOpeningId: "job-1",
    interviewers: [{ interviewerId: "int-99" }],
  };

  assert(
    canAdvanceApplication(recruiter) === true,
    "Recruiter can advance applications",
  );
  assert(
    canAdvanceApplication(interviewer) === false,
    "Interviewer CANNOT advance applications",
  );
  assert(
    canRejectApplication(recruiter) === true,
    "Recruiter can reject applications",
  );
  assert(
    canRejectApplication(interviewer) === false,
    "Interviewer CANNOT reject applications",
  );
  assert(
    canAssignInterviewer(recruiter) === true,
    "Recruiter can assign interviewers",
  );
  assert(
    canAssignInterviewer(interviewer) === false,
    "Interviewer CANNOT assign interviewers",
  );
  assert(
    canExportApplications(recruiter) === true,
    "Recruiter can export pipeline CSV",
  );
  assert(
    canExportApplications(interviewer) === false,
    "Interviewer CANNOT export pipeline CSV",
  );

  assert(
    canViewApplication(interviewer, assignedApp) === true,
    "Interviewer CAN view assigned application",
  );
  assert(
    canViewApplication(interviewer, unassignedApp) === false,
    "Interviewer CANNOT view unassigned application",
  );
  assert(
    canSubmitFeedback(interviewer, assignedApp) === true,
    "Interviewer CAN submit feedback on assigned application",
  );
  assert(
    canSubmitFeedback(interviewer, unassignedApp) === false,
    "Interviewer CANNOT submit feedback on unassigned application",
  );

  // 3. CSV Escaping Rules
  assert(
    escapeCsvCell('Smith, "John"') === '"Smith, ""John"""',
    "CSV cell escapes double-quotes and commas",
  );

  const sampleApps = [
    {
      id: "1",
      candidateName: "John, Doe",
      email: "john@example.com",
      source: "LinkedIn",
      stage: "INTERVIEW",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      jobOpening: {
        title: "Senior Engineer",
        department: "Engineering",
      },
    },
  ];

  const csv = generateApplicationsCsv(sampleApps);
  assert(
    csv.includes('"John, Doe"') && csv.includes('"Senior Engineer"'),
    "CSV generation contains properly escaped values",
  );

  console.log("\n✅ ALL BUSINESS-RULE TESTS PASSED SUCCESSFULLY!");
}

runTests();
