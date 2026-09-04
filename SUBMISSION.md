# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** https://github.com/alok-jp/hiring-pipeline/
- **Live application:** https://hiregrid-phi.vercel.app/

## Notes for the reviewer

- The database runs on Neon Serverless PostgreSQL. If the instance has scaled down due to inactivity, the very first database query may take 1-2 seconds to wake the compute endpoint.
- Demo data has been seeded across all three roles, with candidates present in every pipeline stage (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`), scheduled and completed interviews with feedback, and realistic stalled candidates (>10 days in stage) so the alerts system displays active data immediately.
 
## Demo credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Master Admin** | Admin User | `admin@hirepipe.dev` | `Admin@123` |
| **Recruiter** | Rachel Vance | `recruiter@hirepipe.dev` | `Password123!` |
| **Recruiter (Alt)** | Samira Khan | `recruiter2@hirepipe.dev` | `Password123!` |
| **Interviewer** | Ian Mercer | `interviewer@hirepipe.dev` | `Password123!` |
| **Interviewer (Alt)** | Maya Lin | `interviewer2@hirepipe.dev` | `Password123!` |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix UI / Shadcn, Recharts | Server components for initial page loads, fast client interactivity for pipeline drag/updates, declarative accessible dialogs, and high-fidelity data visualization. |
| Backend | tRPC v11, TanStack Query v5, Better Auth, Zod | Complete end-to-end type safety between server procedures and UI components without code generation steps, with role-based procedure middleware. |
| Database | PostgreSQL (Neon) with Prisma ORM 7 | Relational integrity, relational indexes on foreign keys and timestamps, automated migrations, and transactional isolation (`prisma.$transaction`). |
| Hosting | Vercel (Next.js Edge/Serverless) + Neon Serverless PostgreSQL | Zero-config edge deployment, fast asset distribution, and serverless database scaling. |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Server-enforced RBAC with `MASTER_ADMIN`, `RECRUITER`, and `INTERVIEWER` roles via tRPC middleware; interviewers cannot access unassigned candidate pipelines or alter stages. |
| 2 | Job openings | Done | Full creation, editing, soft archiving (`status: ARCHIVED`), and restoring; archived requisitions preserve candidate applications and audit histories. |
| 3 | Applications inside job openings | Done | Every application is bound to a single job opening with candidate name, email, source, and notes. Job opening workspace lists all associated candidates. |
| 4 | A pipeline with rules | Done | Enforces strict sequence `APPLIED → SCREENING → INTERVIEW → OFFER → HIRED`. Rejection allowed from any stage preserving `stageBeforeRejection`. Reinstatement restores exact prior stage. Illegal jumps or advancing hired candidates are rejected with explicit server errors. Requires completed interview before advancing to OFFER. |
| 5 | Interview panel | Done | Multi-interviewer assignment restricted strictly to users with `Role.INTERVIEWER`. Interviewers have dedicated `/interviewer` workspace showing only assigned applications. |
| 6 | Finding candidates | Done | Server-side text search over candidate name and email, filtering by job opening, stage, and source, sorting, and pagination calculated in PostgreSQL via `skip`/`take`. |
| 7 | Acting on many candidates at once | Done | Multi-candidate selection with bulk advance and bulk reject reporting per-candidate success/refusal reasons. Server-side pipeline snapshot CSV export with proper RFC 4180 escaping. |
| 8 | A dashboard | Done | Headline KPIs (open positions, active candidates, interviews this week, monthly hires), stage & department breakdowns, and 12-week quarterly rolling application volume chart. |
| 9 | History you cannot rewrite | Done | Immutable `ApplicationEvent` log tracks creation, stage progressions (old/new stage + actor), rejections, reinstatements, and evaluations; no update or delete mutations are exposed. |
| 10 | Stalled-application alerts | Done | Automatic calculation of applications >10 days in current stage. Nav bar badge alert counter. Recruiters can dismiss alerts per stage period, and alerts reset/reappear if candidate advances and stalls again. |

## How much time did you actually spend?

Approximately 13-14 hours total, spread across 5 days (architecture planning, schema design, core business rule implementation, UI decluttering, unit/integration test coverage, and documentation).

## What would you do next, with another 12 hours?

1. **Public Careers Page:** Build a public-facing `/careers` portal where external candidates can browse all active open job requisitions (with department and location filtering), read role requirements, and submit their application directly into the hiring pipeline (entering at the `APPLIED` stage) without needing an account or dashboard login.
2. **Self-Service Candidate Interview Scheduling:** Implement automated candidate booking links where candidates select available interview time slots synchronized directly with interviewer Google/Outlook calendars based on real-time availability.
3. **Dynamic Stage-Specific Scorecards:** Allow recruiters to configure customized rubric criteria (e.g., Coding Rigor, Distributed Systems Design, Values Alignment) tailored per job opening rather than fixed standard rating fields.

## What are you least happy with in this codebase, and why?

I am least satisfied with the **synchronous execution of side effects and lack of an asynchronous background event queue**. 

Currently, actions like sending email invitations via SMTP, triggering notifications, and evaluating stalled application thresholds run synchronously within the Next.js request lifecycle or rely on client-triggered tRPC queries. In an enterprise production architecture, these operations should be decoupled using an event-driven worker queue (such as BullMQ, Inngest, or pg-boss). 

If an external SMTP server experiences latency or network failure, it shouldn't hold open or jeopardize the user's HTTP request transaction. Furthermore, stalled candidate alerts are currently computed on-demand via database queries rather than an asynchronous scheduled cron service that precomputes alert statuses and dispatches daily recruiter digest summaries. Decoupling these background workflows from the active request path would significantly improve system resilience and throughput.
