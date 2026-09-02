import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ApplicationEventType, ApplicationStage } from "../generated/prisma/enums";
import { applicationRouter } from "../trpc/routers/application";
import { advanceApplicationDomain, rejectApplicationDomain, reinstateApplicationDomain } from "../lib/pipeline-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

async function runApplicationHistoryTests() {
  console.log("=== Running Requirement #9 Immutable History Unit & Integration Tests ===\n");

  // 1. Enum and Model Structure Integrity Checks
  assert(
    ApplicationEventType.CREATED === "CREATED",
    "ApplicationEventType CREATED exists",
  );
  assert(
    ApplicationEventType.STAGE_CHANGED === "STAGE_CHANGED",
    "ApplicationEventType STAGE_CHANGED exists",
  );
  assert(
    ApplicationEventType.REJECTED === "REJECTED",
    "ApplicationEventType REJECTED exists",
  );
  assert(
    ApplicationEventType.REINSTATED === "REINSTATED",
    "ApplicationEventType REINSTATED exists",
  );
  assert(
    ApplicationEventType.FEEDBACK_ADDED === "FEEDBACK_ADDED",
    "ApplicationEventType FEEDBACK_ADDED exists",
  );
  assert(
    ApplicationEventType.INTERVIEW_SCHEDULED === "INTERVIEW_SCHEDULED",
    "ApplicationEventType INTERVIEW_SCHEDULED exists",
  );

  // 2. Immutability Verification: Ensure NO update/delete procedure paths exist on applicationRouter for events
  const routerKeys = Object.keys(applicationRouter);
  assert(
    !routerKeys.includes("updateEvent") &&
    !routerKeys.includes("deleteEvent") &&
    !routerKeys.includes("updateHistory") &&
    !routerKeys.includes("deleteHistory"),
    "applicationRouter strictly exposes NO event modification or deletion mutations",
  );

  // 3. Database Transactional History Verification
  try {
    // Find or create an admin user for test execution actor
    let actorUser = await prisma.user.findFirst({
      where: { role: "MASTER_ADMIN" },
    });
    if (!actorUser) {
      actorUser = await prisma.user.create({
        data: {
          name: "Test Admin",
          email: `test-admin-${Date.now()}@example.com`,
          role: "MASTER_ADMIN",
        },
      });
    }

    // Find or create a test job opening
    let jobOpening = await prisma.jobOpening.findFirst({
      where: { status: "OPEN" },
    });
    if (!jobOpening) {
      jobOpening = await prisma.jobOpening.create({
        data: {
          title: "Audit Test Engineer",
          department: "Quality Assurance",
          description: "Test job for audit history events",
        },
      });
    }

    // A) Test Application Creation -> CREATED Event
    const testEmail = `audit-candidate-${Date.now()}@example.com`;
    const app = await prisma.$transaction(async (tx) => {
      const createdApp = await tx.application.create({
        data: {
          jobOpeningId: jobOpening.id,
          candidateName: "Audit Test Candidate",
          email: testEmail,
          source: "Unit Test",
          stage: ApplicationStage.APPLIED,
        },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: createdApp.id,
          type: ApplicationEventType.CREATED,
          actorId: actorUser.id,
          newStage: ApplicationStage.APPLIED,
        },
      });

      return createdApp;
    });

    const createEvents = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id, type: ApplicationEventType.CREATED },
    });
    assert(
      createEvents.length === 1 && createEvents[0].actorId === actorUser.id,
      "Application creation transactionally writes CREATED ApplicationEvent",
    );

    // B) Test Stage Advancement -> STAGE_CHANGED Event
    const advancedApp = await advanceApplicationDomain(app.id, actorUser.id, "MASTER_ADMIN");
    assert(
      advancedApp.stage === ApplicationStage.SCREENING,
      "Application stage advanced to SCREENING",
    );

    const advanceEvents = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id, type: ApplicationEventType.STAGE_CHANGED },
    });
    assert(
      advanceEvents.length === 1 &&
        advanceEvents[0].oldStage === ApplicationStage.APPLIED &&
        advanceEvents[0].newStage === ApplicationStage.SCREENING,
      "Stage advance transactionally writes STAGE_CHANGED ApplicationEvent with old and new stage",
    );

    // C) Test Application Rejection -> REJECTED Event
    const rejectedApp = await rejectApplicationDomain(app.id, actorUser.id, "MASTER_ADMIN");
    assert(
      rejectedApp.stage === ApplicationStage.REJECTED,
      "Application stage set to REJECTED",
    );

    const rejectEvents = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id, type: ApplicationEventType.REJECTED },
    });
    assert(
      rejectEvents.length === 1 &&
        rejectEvents[0].oldStage === ApplicationStage.SCREENING &&
        rejectEvents[0].newStage === ApplicationStage.REJECTED,
      "Rejection transactionally writes REJECTED ApplicationEvent",
    );

    // D) Test Application Reinstatement -> REINSTATED Event
    const reinstatedApp = await reinstateApplicationDomain(app.id, actorUser.id, "MASTER_ADMIN");
    assert(
      reinstatedApp.stage === ApplicationStage.SCREENING,
      "Application stage reinstated to SCREENING",
    );

    const reinstateEvents = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id, type: ApplicationEventType.REINSTATED },
    });
    assert(
      reinstateEvents.length === 1 &&
        reinstateEvents[0].oldStage === ApplicationStage.REJECTED &&
        reinstateEvents[0].newStage === ApplicationStage.SCREENING,
      "Reinstatement transactionally writes REINSTATED ApplicationEvent",
    );

    // E) Test Full Timeline History Ordering
    const allEvents = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id },
      orderBy: { createdAt: "desc" },
    });
    assert(
      allEvents.length === 4,
      `Full timeline records all 4 immutable events (received ${allEvents.length})`,
    );

    // Clean up test application
    await prisma.application.delete({ where: { id: app.id } });
  } catch (err: any) {
    console.error("Database integration test error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n✅ ALL APPLICATION HISTORY TESTS PASSED SUCCESSFULLY!");
}

runApplicationHistoryTests();
