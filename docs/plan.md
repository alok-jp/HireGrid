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

---

## What order did you build in, and why that order?

1. **Database Schema & Auth Client first**: Essential foundation for typed data access.
2. **API & tRPC Handlers second**: Backend procedures required before connecting client forms.
3. **UI Components & Pages third**: Wired up forms once backend endpoints were working.
4. **UI Architecture & Decluttering fourth**: Applied design tokens, identity dropdowns, and decluttered card views after features were functionally complete.
5. **Interview Panel & Role Workflows fifth**: Built many-to-many interviewer assignment joins, server authorization checks, and dedicated interviewer dashboard views.
6. **Candidate Search & Server-Side Filtering sixth**: Built full-text candidate search, multi-field filters, whitelisted sorting, server pagination, and Select label resolution.

---

## What did you estimate versus what it actually took?

- **Database & Auth Setup**: Estimated 30 mins; took ~25 mins.
- **UI & Routing**: Estimated 45 mins; took ~60 mins due to fixing missing API routes and linter formats.
- **SMTP Migration & Performance**: Estimated 30 mins; took ~30 mins.
- **Job Openings & Applications**: Estimated 60 mins; took ~55 mins.
- **UI Redesign & Decluttering**: Estimated 40 mins; took ~35 mins.
- **Interview Panel & Security**: Estimated 45 mins; took ~40 mins.
- **Candidate Search & Pagination**: Estimated 50 mins; took ~60 mins.

---

## What did you cut when you ran short?

- Used inline contextual overflow menus (`DropdownMenu`) for secondary actions rather than creating redundant full-page confirmation forms.
