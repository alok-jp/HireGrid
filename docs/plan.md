# Plan

Answer each of these, in your own words.

- How did you break the work into sessions?
- What order did you build in, and why that order?
- What did you estimate versus what it actually took?
- What did you cut when you ran short?

---

## How did you break the work into sessions?

- **Session 1: Core Setup**: Database schema (`User`, `Session`, `Account`, `Invitation`), Prisma Client setup, and Better Auth configuration.
- **Session 2: Routes & Forms**: Auth forms, layouts, tRPC invitation endpoints, and SMTP email sending.
- **Session 3: Role Guards & Performance**: Strict layout access control, React `cache()` session deduplication, and database indexing.
- **Session 4: Job Openings Feature**: Backend `jobOpeningRouter` procedures (`create`, `update`, `archive`, `restore`, `list`, `getById`), Zod validation form, and recruiter views (`/recruiter/job-openings`, `/create`, `/archived`, `/[id]/edit`).
- **Session 5: Applications & UI Redesign**: `Application` schema & relations, `applicationRouter` procedures, `ApplicationForm`/`ApplicationList` components, unified `AppHeader`, design tokens in `globals.css`, flat typography stat row, and decluttered card list views.
- **Session 6: Interview Panel Feature & Auto-Registration**: `ApplicationInterviewer` join table, `user.getInterviewers` & `application.assignInterviewer` / `removeInterviewer` / `myAssigned` procedures, `InterviewPanel` UI component, `InterviewerApplicationList` dashboard, and automatic default `INTERVIEWER` role assignment on signup.
- **Session 7: Candidate Search, Filtering & Pagination**: `application.list` & `application.getSources` server procedures, `CandidateSearchList` client component, debounced search, position/stage/source filters, whitelisted sorting, server pagination, and Select label display resolution.
- **Session 8: Bulk Candidate Actions & Simple CSV Export**: `application.bulkAdvance` and `application.bulkReject` procedures with independent candidate processing and per-candidate result reporting (`{ succeeded, refused }`). Server-side CSV snapshot procedure (`application.exportCsv`) using direct in-memory string formatting instead of complex streaming to keep the design clean and simple. Built floating bulk toolbar, candidate checkboxes, confirmation modal, per-candidate results modal, and instant browser CSV download.
- **Session 9: Production Quality Improvements**: Centralized policy authorization layer (`src/lib/policy.ts`), domain pipeline service (`src/lib/pipeline-service.ts`), structured interview feedback model (`ApplicationFeedback`), live candidate email duplicate detector (`checkDuplicateCandidateEmail`), candidate detail workspace page, and business-rule test suite (`src/__tests__/pipeline-policy.test.ts`).
- **Session 10: Interview Scheduling & Recruiter Dashboard**: Created `Interview` & `InterviewInterviewer` models, server-side double-booking collision algorithm (`checkDoubleBookingCollision`), scheduled interview widget, scheduling/rescheduling dialog, `dashboard.getStats` aggregator procedure, and responsive Recharts visualization widgets (`DashboardMetrics`).
- **Session 11: Concurrency Safety & Audit Logging**: Implemented atomic conditional SQL stage updates (`UPDATE application SET stage = nextStage WHERE id = X AND stage = CURRENT_STAGE`), structured audit logger (`src/lib/logger.ts`), mandatory completed interview check for `INTERVIEW → OFFER`, interviewer candidate evaluation route `/interviewer/applications/[applicationId]`, automated k6 load test summary reports, and 37-test automated verification suite.

---

## What order did you build in, and why that order?

1. **Database Schema & Auth Client first**: Essential foundation for typed data access.
2. **API & tRPC Handlers second**: Backend procedures required before connecting client forms.
3. **UI Components & Pages third**: Wired up forms once backend endpoints were working.
4. **UI Architecture & Decluttering fourth**: Applied design tokens, identity dropdowns, and decluttered card views after features were functionally complete.
5. **Interview Panel & Role Workflows fifth**: Built many-to-many interviewer assignment joins, server authorization checks, and dedicated interviewer dashboard views.
6. **Candidate Search & Server-Side Filtering sixth**: Built full-text candidate search, multi-field filters, whitelisted sorting, server pagination, and Select label resolution.
7. **Bulk Actions & Simple CSV Export seventh**: Built partial-success bulk advancement/rejection procedures and direct in-memory CSV generation to keep pipeline export simple without stream pipeline complexity.
8. **Interview Scheduling & Dashboard eighth**: Built time-slotted interview scheduling with double-booking collision protection and recruiter metrics dashboard with Recharts visualizations.
9. **Concurrency Safety & Audit Logging ninth**: Hardened mutations with atomic conditional SQL updates and structured audit event logging.

---

## What did you estimate versus what it actually took?

- **Database & Auth Setup**: Estimated 30 mins; took ~25 mins.
- **UI & Routing**: Estimated 45 mins; took ~60 mins due to fixing missing API routes and linter formats.
- **SMTP Migration & Performance**: Estimated 30 mins; took ~30 mins.
- **Job Openings & Applications**: Estimated 60 mins; took ~55 mins.
- **UI Redesign & Decluttering**: Estimated 40 mins; took ~35 mins.
- **Interview Panel & Security**: Estimated 45 mins; took ~40 mins.
- **Candidate Search & Pagination**: Estimated 50 mins; took ~60 mins.
- **Bulk Actions & CSV Export**: Estimated 45 mins; took ~40 mins.
- **Interview Scheduling & Dashboard**: Estimated 60 mins; took ~55 mins.
- **Concurrency & Audit Hardening**: Estimated 45 mins; took ~40 mins.

---

## What did you cut when you ran short?

- **Streamed CSV Exports**: Avoided introducing Node.js readable streams or Web Streams API for CSV export. Using direct in-memory string formatting inside the server procedure kept the CSV export simple, deterministic, and fast while avoiding stream pipeline complexity.
- **Immutable Audit History Timeline & Stalled Alerts (Requirements 9 & 10)**: Intentionally deferred per explicit project scope constraints.
