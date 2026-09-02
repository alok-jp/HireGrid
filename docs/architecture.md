# Architecture

Answer each of these, in your own words, once the system has taken real shape.

- What are the moving pieces, and how do they talk to each other?
- Where does each piece run?
- What is the request path for one representative user action, end to end?
- What did you decide *not* to build, and why?

---

## What are the moving pieces, and how do they talk to each other?

1. **UI Layer (Next.js 16 App Router & React 19)**:
   - React 19 Client components for auth, invitations, job openings, candidate applications, and interviewer panel assignments built with React Hook Form and Zod.
   - Unified `AppHeader` component managing identity dropdowns and navigation across Admin, Recruiter, and Interviewer portals.
   - Styled with Tailwind CSS, custom design tokens in `globals.css`, Shadcn/ui (Base UI primitives), Framer Motion, and Sonner toasts.
   - Client calls tRPC typed procedures via `@trpc/react-query`.
2. **API & Route Handlers**:
   - `/api/auth/[...all]`: Better Auth handler for session management, HTTP-only cookies, and database hooks (`user.create.before`).
   - `/api/trpc/[trpc]`: tRPC fetch handler serving type-safe RPC procedures.
3. **Role Authorization Middleware**:
   - Server-side middleware (`recruiterProcedure`, `adminProcedure`, `protectedProcedure`, `interviewerProcedure`) verifies session roles (`MASTER_ADMIN`, `RECRUITER`, `INTERVIEWER`) on every procedure call.
4. **Data Access & Storage**:
   - Prisma ORM 7 connecting to Neon serverless PostgreSQL (`user`, `session`, `account`, `invitation`, `job_opening`, `application`, `application_interviewer`).

---

## Where does each piece run?

- **Browser**: React UI components, client form state, Sonner toast notifications, Framer Motion disclosures, and tRPC React Query cache (`staleTime: 5000ms`, `refetchOnWindowFocus: false`).
- **Server (Node.js)**: Next.js App Router server components, tRPC routers (`invitation`, `jobOpening`, `application`, `user`), Better Auth logic, and Nodemailer SMTP client.
- **Database**: Hosted Neon PostgreSQL database instance.

---

## What is the request path for one representative user action, end to end?

Here is what happens when a recruiter archives a job opening:

1. Recruiter clicks **Archive position** inside the contextual overflow menu (`DropdownMenu`) on `/recruiter/job-openings`.
2. Client invokes `trpc.jobOpening.archive.useMutation({ id })`.
3. An HTTP POST request reaches `/api/trpc/jobOpening.archive`.
4. `recruiterProcedure` middleware extracts the session cookie via `getCurrentSession()` and confirms the user has `RECRUITER` role.
5. Server verifies the job opening exists in PostgreSQL and executes `prisma.jobOpening.update({ where: { id }, data: { status: "ARCHIVED" } })`. Related candidate applications remain untouched.
6. Server returns the updated job object.
7. Client invalidates `jobOpening.list` cache via `utils.jobOpening.list.invalidate()`, triggers a Sonner toast (*"Job opening archived"*), and re-renders the list UI.

Here is what happens when a recruiter assigns an interviewer to an application panel:

1. Recruiter opens candidate options, clicks **Assign Interviewer**, selects an interviewer from the list, and clicks **Assign to Panel**.
2. Client invokes `trpc.application.assignInterviewer.useMutation({ applicationId, interviewerId })`.
3. Server executes `recruiterProcedure` validation, checks the target user exists and has `role === "INTERVIEWER"`, and executes `prisma.applicationInterviewer.upsert()`.
4. On success, client invalidates `utils.application.getInterviewers.invalidate()`, triggers a Sonner toast (*"Interviewer assigned to panel"*), and updates the panel UI.

---

## What did you decide *not* to build, and why?

- **Public Applicant Careers Portal**: Candidate applications are added directly by recruiters inside job openings as specified by core workflow rules.
- **Resend Email Service**: Decided against using Resend because domain verification was taking too much time; opted for generic SMTP via Nodemailer instead.
- **Client-Only Permission Guards**: Avoided relying on client-side routing checks for application access; enforced interviewer assignment validation strictly on the server inside `application.getById`.
