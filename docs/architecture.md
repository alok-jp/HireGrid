# Architecture

Answer each of these, in your own words, once the system has taken real shape.

- What are the moving pieces, and how do they talk to each other?
- Where does each piece run?
- What is the request path for one representative user action, end to end?
- What did you decide *not* to build, and why?

---

## What are the moving pieces, and how do they talk to each other?

1. **UI Layer (Next.js 16 App Router & React 19)**:
   - React 19 Client components for authentication, user management, job openings, candidate search/filtering/pagination, candidate detail workspace, interview scheduling, structured interview feedback, append-only application timeline (`ApplicationTimeline`), bulk candidate actions, and recruiter dashboard visualizations built with React Hook Form, Zod, and Recharts.
   - Unified `AppHeader` component managing identity dropdowns and portal navigation across Admin, Recruiter, and Interviewer views.
   - Styled with Tailwind CSS, custom design tokens in `globals.css`, Shadcn/ui (Base UI primitives), Framer Motion disclosures, and Sonner toast notifications.
   - Client calls tRPC typed procedures via `@trpc/react-query`.
2. **API & Route Handlers**:
   - `/api/auth/[...all]`: Better Auth handler for session management, HTTP-only cookies, and database hooks (`user.create.before`).
   - `/api/trpc/[trpc]`: tRPC fetch handler serving type-safe RPC procedures.
3. **Policy Authorization & Domain Services**:
   - Centralized policy helper functions (`src/lib/policy.ts`) enforcing `canViewApplication`, `canEditApplication`, `canAdvanceApplication`, `canRejectApplication`, `canReinstateApplication`, `canAssignInterviewer`, `canSubmitFeedback`, and `canExportApplications` across procedure handlers.
   - Centralized domain pipeline functions (`src/lib/pipeline-service.ts`) managing single and bulk stage progressions, atomic conditional SQL concurrency checks (`UPDATE ... WHERE id = X AND stage = CURRENT_STAGE`), rejections, reinstatements, completed interview validation for `INTERVIEW → OFFER`, and transactional `ApplicationEvent` creation.
   - Duplicate candidate detector (`src/lib/duplicate-detector.ts`) checking normalized emails across active candidate records.
   - Audit logging engine (`src/lib/logger.ts`) writing structured audit events (`STAGE_ADVANCE`, `STAGE_REJECT`, `INTERVIEW_SCHEDULED`, `INTERVIEW_COMPLETED`, `BULK_ACTION`, `CSV_EXPORT`, `AUTH_EVENT`).
4. **Data Access & Storage**:
   - Prisma ORM 7 connecting to Neon serverless PostgreSQL (`user`, `session`, `account`, `invitation`, `job_opening`, `application`, `application_interviewer`, `application_feedback`, `interview`, `interview_interviewer`, `application_event`).

---

## Where does each piece run?

- **Browser**: React UI components, client form state, Sonner toast notifications, Framer Motion disclosures, selection state, Recharts SVG/HTML graphs, and tRPC React Query cache (`staleTime: 5000ms`, `refetchOnWindowFocus: false`).
- **Server (Node.js)**: Next.js App Router server components, tRPC routers (`invitation`, `jobOpening`, `application`, `interview`, `dashboard`, `user`), policy & domain services (`policy.ts`, `pipeline-service.ts`, `duplicate-detector.ts`, `logger.ts`), Better Auth logic, Nodemailer SMTP client, and in-memory CSV snapshot exporter (`csv-exporter.ts`).
- **Database**: Hosted Neon PostgreSQL database instance.

---

## What is the request path for one representative user action, end to end?

### 1. Stage Advancement & Transactional Audit History Creation
1. Recruiter opens candidate workspace at `/recruiter/job-openings/[id]/applications/[applicationId]` and clicks **Advance Candidate**.
2. Client calls `trpc.application.advance.useMutation({ id })`.
3. Server executes `recruiterProcedure` middleware, verifying authentication and checking `canAdvanceApplication(user)`.
4. Server delegates to `advanceApplicationDomain()` in `src/lib/pipeline-service.ts`.
5. Inside a single Prisma transaction (`prisma.$transaction`), server verifies stage requirements, executes atomic conditional update `updateMany({ where: { id, stage: oldStage }, data: { stage: nextStage } })`, and creates an immutable `ApplicationEvent` (`type: STAGE_CHANGED`, `actorId: userId`, `oldStage`, `newStage`).
6. If a concurrent update modified the stage, the transaction throws `TRPCError(CONFLICT)` and rolls back.
7. Client invalidates `application.getById`, `application.getHistory`, and `dashboard.getStats`, refreshing candidate state and timeline UI.

---

## What did you decide *not* to build, and why?

- **Full Event Sourcing / Kafka / External Audit Platforms**: Decided against building a full event-sourcing engine or external message queue. An append-only `ApplicationEvent` database table written inside the same Prisma transaction as state updates provides 100% audit immutability, zero drift, and simple querying without distributed infrastructure complexity.
- **Streamed CSV Responses**: Decided against using Node.js readable streams, Web Streams API, or chunked transfer encoding for CSV export. Direct in-memory string formatting (`generateApplicationsCsv`) inside the server procedure keeps the implementation simple, fast, and deterministic for standard hiring pipeline datasets without stream pipeline complexity.
- **Atomic Batch Rollbacks for Bulk Actions**: Decided against wrapping bulk candidate actions in a single atomic transaction or `updateMany()`. Selected candidates may be at different pipeline stages; evaluating candidates independently allows valid candidate advances to succeed while returning explicit per-candidate refusal reasons.
