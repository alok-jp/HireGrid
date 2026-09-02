# Architecture

Answer each of these, in your own words, once the system has taken real shape.

- What are the moving pieces, and how do they talk to each other?
- Where does each piece run?
- What is the request path for one representative user action, end to end?
- What did you decide *not* to build, and why?

---

## What are the moving pieces, and how do they talk to each other?

1. **UI Layer (Next.js 16 App Router & React 19)**:
   - React 19 Client components for authentication, user management, job openings, candidate search, candidate detail workspace, structured interview feedback, bulk candidate actions, and interviewer panel assignments built with React Hook Form and Zod.
   - Unified `AppHeader` component managing identity dropdowns and portal navigation across Admin, Recruiter, and Interviewer views.
   - Styled with Tailwind CSS, custom design tokens in `globals.css`, Shadcn/ui (Base UI primitives), Framer Motion disclosures, and Sonner toast notifications.
   - Client calls tRPC typed procedures via `@trpc/react-query`.
2. **API & Route Handlers**:
   - `/api/auth/[...all]`: Better Auth handler for session management, HTTP-only cookies, and database hooks (`user.create.before`).
   - `/api/trpc/[trpc]`: tRPC fetch handler serving type-safe RPC procedures.
3. **Policy Authorization & Domain Services**:
   - Centralized policy helper functions (`src/lib/policy.ts`) enforcing `canViewApplication`, `canEditApplication`, `canAdvanceApplication`, `canRejectApplication`, `canReinstateApplication`, `canAssignInterviewer`, `canSubmitFeedback`, and `canExportApplications` across procedure handlers.
   - Centralized domain pipeline functions (`src/lib/pipeline-service.ts`) managing single and bulk stage progressions, rejections, and reinstatements.
   - Duplicate candidate detector (`src/lib/duplicate-detector.ts`) checking normalized emails across active candidate records.
4. **Data Access & Storage**:
   - Prisma ORM 7 connecting to Neon serverless PostgreSQL (`user`, `session`, `account`, `invitation`, `job_opening`, `application`, `application_interviewer`, `application_feedback`).

---

## Where does each piece run?

- **Browser**: React UI components, client form state, Sonner toast notifications, Framer Motion disclosures, selection state, and tRPC React Query cache (`staleTime: 5000ms`, `refetchOnWindowFocus: false`).
- **Server (Node.js)**: Next.js App Router server components, tRPC routers (`invitation`, `jobOpening`, `application`, `user`), policy & domain services (`policy.ts`, `pipeline-service.ts`, `duplicate-detector.ts`), Better Auth logic, Nodemailer SMTP client, and in-memory CSV snapshot exporter (`csv-exporter.ts`).
- **Database**: Hosted Neon PostgreSQL database instance.

---

## What is the request path for one representative user action, end to end?

### 1. Generating Pipeline Snapshot CSV
1. Recruiter clicks **Export Pipeline CSV** on `/recruiter/candidates`.
2. `CandidateSearchList` triggers `trpc.application.exportCsv.useQuery()`.
3. An HTTP GET request reaches `/api/trpc/application.exportCsv`.
4. Server verifies the session user via `protectedProcedure` and evaluates `canExportApplications(user)`.
5. Server queries PostgreSQL for applications belonging to `JobOpening.status === "OPEN"`, applying viewer scope (interviewers export assigned candidates only).
6. Server passes database records to `generateApplicationsCsv()` in `src/lib/csv-exporter.ts`, formatting columns (`Candidate Name`, `Email`, `Job Opening`, `Department`, `Stage`, `Source`, `Applied Date`, `Last Updated`) and escaping double-quotes, commas, and newlines into an in-memory CSV string.
7. Server returns `{ filename, csvContent, count }`.
8. Client receives the response, creates a Blob object URL (`URL.createObjectURL(blob)`), triggers an automated browser download for `pipeline-export-YYYY-MM-DD.csv`, and displays a Sonner toast notification.

### 2. Archiving a Job Opening
1. Recruiter clicks **Archive position** inside the contextual overflow menu (`DropdownMenu`) on `/recruiter/job-openings`.
2. Client invokes `trpc.jobOpening.archive.useMutation({ id })`.
3. An HTTP POST request reaches `/api/trpc/jobOpening.archive`.
4. `recruiterProcedure` middleware extracts the session cookie via `getCurrentSession()` and confirms the user has `RECRUITER` role.
5. Server verifies the job opening exists in PostgreSQL and executes `prisma.jobOpening.update({ where: { id }, data: { status: "ARCHIVED" } })`. Related candidate applications remain untouched.
6. Server returns the updated job object.
7. Client invalidates `jobOpening.list` cache via `utils.jobOpening.list.invalidate()`, triggers a Sonner toast (*"Job opening archived"*), and re-renders the list UI.

---

## What did you decide *not* to build, and why?

- **Streamed CSV Responses**: Decided against using Node.js readable streams, Web Streams API, or chunked transfer encoding for CSV export. Direct in-memory string formatting (`generateApplicationsCsv`) inside the server procedure keeps the implementation simple, fast, and deterministic for standard hiring pipeline datasets without stream pipeline complexity.
- **Atomic Batch Rollbacks for Bulk Actions**: Decided against wrapping bulk candidate actions in a single atomic transaction or `updateMany()`. Selected candidates may be at different pipeline stages; evaluating candidates independently allows valid candidate advances to succeed while returning explicit per-candidate refusal reasons.
- **Dashboard, Immutable Audit Timeline, & Stalled Alerts (Requirements 8–10)**: Intentionally deferred to focus on production-hardening core pipeline features.
- **Public Applicant Careers Portal**: Candidate applications are added directly by recruiters inside job openings as specified by core workflow rules.
- **Resend Email Service**: Decided against using Resend because domain verification was taking too much time; opted for generic SMTP via Nodemailer instead.
