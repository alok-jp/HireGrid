# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## Setting up Role-Based Auth without Client Privileges

### Prompt
How do I setup role based access control in Better Auth without letting users choose their role during signup

### What you got
I got a suggestion to add `additionalFields` under `user` in `betterAuth` with `input: false` and `defaultValue: "INTERVIEWER"`. But the initial code kept `required: true`, which caused Better Auth's validator to fail signups because the client wasn't submitting a role.

### What you corrected
I set `required: false` on the `role` field in `src/lib/auth.ts` and created a server-side database hook on `user.create.before` to assign the invited role automatically.

---

## Migrating from Resend to Generic SMTP

### Prompt
Replace the entire Resend email integration with a generic SMTP-based email implementation using Nodemailer

### What you got
I uninstalled `resend` and installed `nodemailer`. The initial helper needed structured config validation.

---

## Performance Optimization for Slow Logins

### Prompt
it takes too much time in logging in and the site is very very slow what are your suggestions

### What you got
I analyzed the query waterfall and found that multiple layouts and pages were repeatedly fetching the session from PostgreSQL on a single request.

---

## UI/UX Redesign & Decluttering

### Prompt
Redesign this UI to feel like a premium, highly functional product rather than a dashboard template. Reduce visual noise, establish strong hierarchy, declutter cards, use progressive disclosure, and add subtle micro-interactions.

### What you got
Got a 10-point UI architecture plan to collapse user identity into an avatar menu, convert admin 4-card metrics into a flat typography stat row, remove redundant card borders/buttons, replace stage pills with compact border accents, and add Framer Motion disclosures.

---

## Implementing Application Pipeline Structure

### Prompt
What is the best way to implement the pipeline structure (APPLIED -> SCREENING -> INTERVIEW -> OFFER -> HIRED) with rejection, reinstatement, and server-enforced stage progression?

### What you got
Received an architectural plan to define `ApplicationStage` enum in Prisma, add `stageBeforeRejection` field to preserve pre-rejection state, build a centralized transition helper (`getNextStage`), restrict transition endpoints to `recruiterProcedure` middleware, and calculate stage advancement strictly on the server without accepting client stage overrides.

---

## Resolving Select Label vs Value Display Bug

### Prompt
In frontend it shows the id instead of name when I select the interviewer from drop down of assign interviewer and from drop down of job position in search. The database/API should continue using IDs, frontend stores ID but displays name/title.

### What you got
Updated `InterviewPanel` and `CandidateSearchList` select components to resolve selected IDs against loaded arrays (`selectedJobOpening`, `selectedInterviewer`) and explicitly render human-readable name/title labels inside `<SelectValue>` while preserving database IDs in state and mutation payloads.

---

## Generating Pipeline Snapshot CSV from Database Records

### Prompt
How should I generate a CSV snapshot of open job position candidates server-side from PostgreSQL records without using streaming, and download it cleanly in the browser?

### What you got
Received an implementation pattern to create a server helper function `generateApplicationsCsv(applications)` in `src/lib/csv-exporter.ts` that iterates over fetched Prisma database records, formats columns (`Candidate Name`, `Email`, `Job Opening`, `Department`, `Stage`, `Source`, `Applied Date`, `Last Updated`), and escapes special characters (`"`, `,`, `\n`) into a single CSV string. The server procedure `application.exportCsv` queries active open job openings, applies viewer authorization limits, and returns `{ filename, csvContent, count }`. On the client, `CandidateSearchList` triggers the procedure refetch and uses `URL.createObjectURL(new Blob([csvContent]))` to initiate instant browser download without requiring streaming middleware.

---

## Implementing Server-Side Pagination, Filtering & Searching

### Prompt
How should I implement server-side pagination, searching, filtering, and sorting for candidates in Next.js + tRPC + Prisma + PostgreSQL without loading all rows into React memory?

### What you got
Got a pattern to create procedure `application.list` accepting `search`, `jobOpeningId`, `stage`, `source`, `sortBy`, `sortOrder`, `page`, and `pageSize`. The procedure builds Prisma `where` filter conditions (searching case-insensitively over `candidateName` or `email`), applies authorization boundaries (restricting interviewers to assigned candidates), and runs a `prisma.$transaction([ findMany({ skip, take }), count() ])` returning paginated items and pagination metadata (`page`, `pageSize`, `total`, `totalPages`). On the frontend, `CandidateSearchList` manages debounced search state (300ms), dropdown filters, and server pagination controls.

---

## Visualizing Dashboard Analytics with Recharts Data Charts

### Prompt
How do I implement responsive data visualization charts for recruiter metrics like job position candidate counts, stage distributions, and rolling 12-week quarterly application volume trends using Recharts in Next.js?

### What you got
Received a implementation pattern using `ResponsiveContainer`, `BarChart` (vertical layout for top open positions), and `LineChart` (monotone trend line with `CartesianGrid` and custom tooltips styled to match the dark slate design system). Grouped weekly application buckets server-side using `date-fns` `startOfWeek` and `subWeeks` in procedure `dashboard.getStats` to send formatted time-series data array directly to the client.

---

## Implementing Immutable Application History & Event Timeline

### Prompt
How do I implement an append-only application event system and timeline where every candidate creation, stage change (with old and new stage and actor), rejection, reinstatement, interviewer feedback, and interview scheduling activity is recorded server-side transactionally and can never be edited or deleted by users?

### What you got
Received an architectural pattern to create an `ApplicationEvent` model and `ApplicationEventType` enum in Prisma (`CREATED`, `STAGE_CHANGED`, `REJECTED`, `REINSTATED`, `FEEDBACK_ADDED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_RESCHEDULED`, `INTERVIEW_CANCELLED`). Event creation is executed inside `prisma.$transaction` along with `Application` stage updates in `src/lib/pipeline-service.ts` and tRPC procedures. The backend router exposes `application.getHistory` with strict authorization checks (`canViewApplication`) and deliberately omits any `update` or `delete` procedures. On the frontend, `ApplicationTimeline` queries the history endpoint and renders a vertical activity timeline with event type icons, stage diff badges, actor details, relative timestamps, and evaluation previews.
