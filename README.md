# HirePipe — Engineering Project Brief & Candidate Pipeline

> A robust, end-to-end recruitment management platform designed to replace messy hiring spreadsheets with deterministic stage workflows, multi-interviewer panels, immutable audit logs, and actionable hiring velocity analytics.

---

## 🌐 Live Application & Links

- **Live Production URL:** [https://hiregrid-phi.vercel.app/](https://hiregrid-phi.vercel.app/)
- **GitHub Repository:** [https://github.com/alok-jp/hiring-pipeline/](https://github.com/alok-jp/hiring-pipeline/)
- **Reviewer Documentation:** See [`SUBMISSION.md`](./SUBMISSION.md) for self-evaluation checklist and reviewer notes.

---

## 🏢 Real-World Business Scenario

### The Problem
At fast-growing companies, recruitment operations frequently break down when hiring volume scales faster than tooling:

- **Spreadsheet chaos:** Candidate applications, interview schedules, and referral notes are scattered across disconnected spreadsheets, Notion tables, and Slack channels.
- **Candidates slipping through the cracks:** Candidates sit in intermediate screening or interview stages for 2–3 weeks without recruiter follow-up or scheduling, souring candidate experience and increasing drop-off rates.
- **Lost feedback & broken panels:** Interviewers share unstandardized feedback in direct messages, overwrite each other's notes, or submit evaluations with no structured rubric.
- **Authorization & privacy gaps:** Interviewers often have unrestricted visibility into executive requisitions, compensation offers, or other candidates they are not interviewing.
- **Zero accountability:** Candidates are moved backwards, prematurely rejected, or reinstated with no audit trail explaining who took the action or why.
- **Blind leadership:** Hiring managers and executives lack real-time visibility into hiring pipeline health, bottlenecks, or stage-by-stage drop-off rates.

### The Solution: HirePipe
HirePipe is built as the central operating system for high-velocity recruiting teams. It unifies requisition lifecycles, structured candidate evaluations, role-based access control, automated stalled-application alerts, and executive hiring analytics into a secure, intuitive, and deterministic workflow.

---

## 🎯 10 Core Application Goals

Every feature in this application is engineered to meet 10 non-negotiable business goals:

### 1. Accounts & Role-Based Access Control (RBAC)
- Support three distinct organizational personas:
  - **Master Admin:** Organization-wide governance, user provisioning, team management, and invitation dispatch.
  - **Recruiter:** Full candidate requisition management, application reviews, stage transitions, interviewer assignments, bulk actions, and pipeline analytics.
  - **Interviewer:** Scoped access restricted exclusively to assigned candidates, scheduled interview participation, and structured scorecard submission.
- All authorization must be enforced **server-side** at the API layer (not solely hidden in UI buttons). Unauthorized access attempts must fail fast with descriptive 403 Forbidden responses.

### 2. Job Openings Lifecycle
- Support complete CRUD workflows for job requisitions (Job Title, Department, Role Description, and Status).
- Support soft archiving (`ARCHIVED`) and restoration (`OPEN`).
- Archiving a requisition must preserve all historical applications, scheduled interviews, and candidate audit logs intact while safely hiding the job from active recruiting boards.

### 3. Applications Bound to Job Openings
- Every application must strictly belong to exactly one job opening.
- Capture essential candidate metadata: Full Name, Email, Application Source (e.g. LinkedIn, Referral, Inbound), and Notes.
- Provide bi-directional navigation between requisitions and candidate workspaces.

### 4. Deterministic Pipeline State Machine
- Enforce a strict, one-way stage sequence:
  $$\text{Applied} \longrightarrow \text{Screening} \longrightarrow \text{Interview} \longrightarrow \text{Offer} \longrightarrow \text{Hired}$$
- **Stage Progression Rules:**
  - Advancing moves a candidate strictly one stage forward at a time, calculated server-side.
  - Advancing from **Interview** to **Offer** strictly requires at least one completed interview evaluation on record.
  - Rejection (`REJECTED`) is allowed from any active stage and must preserve the candidate's `stageBeforeRejection`.
  - Reinstating a rejected candidate restores them to their exact prior stage (never resetting them back to Applied).
  - Terminal stages (`HIRED`, `REJECTED`) cannot be advanced.
  - Illegal skips (e.g., Applied $\rightarrow$ Offer) must be blocked server-side with meaningful error messages.

### 5. Multi-Interviewer Panel Management
- Support assigning multiple interviewers to a single candidate's panel.
- Only users with the `INTERVIEWER` role may be added to panels. Deactivated or inactive team members cannot be assigned.
- Interviewers must have a dedicated, scoped workspace (`/interviewer`) displaying only the candidates and interview sessions assigned to them.

### 6. Fast Server-Side Search, Filtering & Pagination
- Full-text search across candidate names and email addresses.
- Multi-dimensional server filtering by Job Opening, Hiring Stage, and Application Source.
- Sorting by creation date, stage, or last modified date.
- Database-level pagination (`skip` / `take`) returning total matched counts to handle growing datasets without browser memory bloat.

### 7. Bulk Actions & Pipeline Data Export
- Multi-select candidates across search views for batch processing (Bulk Advance, Bulk Reject).
- Partial-success resilience: Report granular per-candidate results (`succeeded` vs `refused` with individual refusal reasons) rather than failing the entire batch on a single validation collision.
- Export pipeline snapshots as an RFC 4180-compliant CSV with sanitized headers and proper quote/comma escaping.

### 8. Executive Recruiting Analytics & Dashboard
- Real-time headline KPIs: Open Positions, Active Candidates, Interviews Scheduled This Week, and Monthly Hires.
- Interactive candidate distribution breakdowns across pipeline stages and departments.
- Rolling 12-week quarterly application volume trend line to track pipeline growth.
- Interactive drill-downs: clicking a stage metric instantly navigates to the filtered candidate list.

### 9. Immutable Audit Trail & Activity Timeline
- An append-only historical log (`ApplicationEvent`) that records every significant lifecycle milestone:
  - Application created
  - Stage progressed (recording previous stage, new stage, and actor ID)
  - Candidate rejected or reinstated
  - Interview scheduled, rescheduled, completed, or cancelled
  - Scorecard feedback submitted
- Router procedures must strictly expose **no update or delete mutations** on audit records.

### 10. Stalled Application Alerts & Threshold Detection
- Automatically flag any candidate whose current stage has remained unchanged for more than 10 consecutive days (`stageChangedAt`).
- Prominent badge counter in the top navigation bar alerting recruiters to pending bottlenecks.
- Dedicated alerts triage page (`/recruiter/alerts`) with contextual quick actions.
- Scoped dismissals: Recruiters can acknowledge and dismiss an alert for that stage period; if the candidate advances and subsequently stalls for >10 days in the new stage, a fresh alert triggers automatically.

---

## 🔑 Demo Access Credentials

The database is pre-seeded with realistic data across all roles, stages, panels, and stalled alerts:

| Persona | Name | Email | Password | Scope & Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Master Admin** | Admin User | `admin@hirepipe.dev` | `Admin@123` | System oversight, user directories, team invitations |
| **Recruiter** | Rachel Vance | `recruiter@hirepipe.dev` | `Password123!` | Requisition management, pipeline progression, bulk actions, alerts |
| **Recruiter (Alt)** | Samira Khan | `recruiter2@hirepipe.dev` | `Password123!` | Candidate triage, interview scheduling, analytics review |
| **Interviewer** | Ian Mercer | `interviewer@hirepipe.dev` | `Password123!` | Scoped candidate workspace, interview evaluations |
| **Interviewer (Alt)** | Maya Lin | `interviewer2@hirepipe.dev` | `Password123!` | Panel evaluations, scorecard ratings, interview calendar |

---

## ⏱️ Time Budget & Technology Guidelines

### Suggested Time Allocation
This assignment is designed for a target investment of **12 to 16 hours**, emphasizing architectural trade-offs, defensive correctness, and polished UX over feature bloat:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Schema, Prisma Relations & RBAC Auth        (~2.5 hours) │
│ 2. Job Openings, Candidate CRUD & Pipeline     (~3.0 hours) │
│ 3. Interview Panels, Scheduling & Feedback     (~2.5 hours) │
│ 4. Search, Filtering, Bulk Operations & CSV    (~2.5 hours) │
│ 5. Analytics Dashboard & Stalled Alerts Engine (~2.0 hours) │
│ 6. QA Edge Case Hardening & Production Polish  (~2.5 hours) │
└─────────────────────────────────────────────────────────────┘
```

### Technology Standards
- **Framework:** Next.js 16 (App Router) with React 19 Server & Client Components.
- **API Architecture:** tRPC v11 with TanStack React Query v5 — guarantees end-to-end type safety between database schema and frontend UI without code generation.
- **Database & Relational Model:** PostgreSQL (Neon Serverless) managed with Prisma ORM 7, enforcing relational foreign keys, cascade safety, and unique compound constraints.
- **Authentication:** Better Auth v1.7 with secure session cookies and server-side role verification procedures (`recruiterProcedure`, `interviewerProcedure`, `masterAdminProcedure`).
- **Validation:** Zod v4 schemas guarding all mutations, inputs, search parameters, and form submissions with trimming and bounds checks.
- **UI & Accessibility:** Tailwind CSS v4, Radix UI accessible primitives, Lucide icons, and Recharts visualization.
- **Code Quality:** Biome 2.4 for sub-second formatting, strict linting, and zero build warnings.

---

## 🤖 AI Usage Policy

AI coding assistants (Claude, ChatGPT, GitHub Copilot, Gemini) are welcomed and encouraged as productivity amplifiers when used responsibly:

- **What AI is great for:**
  - Generating realistic seed data and mock role descriptions.
  - Accelerating repetitive boilerplate (e.g., Zod schemas, form bindings, SVG icons).
  - Brainstorming adversarial edge cases and stress-testing state machines.
- **What is strictly required of the engineer:**
  - **Complete Technical Ownership:** You must deeply understand, explain, and defend every design decision, database index, transaction boundary, and line of code in the repository.
  - **No Hallucinated Boilerplate:** Never commit unvetted libraries, dead code, swallowed error blocks, or unhandled promises generated by an assistant.
  - **Architectural Intentionality:** Data modeling, state machine transitions, concurrency locks, and authorization middleware must be deliberate architectural choices.

---

## 📦 GitHub, Hosting & Submission Requirements

To ensure an efficient and clean evaluation by reviewers, all submissions must comply with the following:

### 1. Clean GitHub Repository
- **Zero test files, test scripts, or local testing dumps committed:** The codebase must contain only production-ready application code. (Local test scripts, load benchmarks, and scratch files must be excluded or cleaned).
- **Clean Git History:** Meaningful, incremental commit messages demonstrating progressive engineering rather than a single massive squash commit.
- **Proper `.gitignore`:** Ensure `.env`, node modules, build caches (`.next`), and testing artifacts are strictly ignored.

### 2. Live Hosted Deployment
- Deploy the application to a reliable host (e.g. [Vercel](https://vercel.com/)).
- Back the application with a hosted relational database (e.g. [Neon](https://neon.tech/) PostgreSQL).
- Verify that initial page loads, dynamic routes, API mutations, and static assets serve cleanly with zero 500 errors or console panics.

### 3. Submission Documentation
- Maintain a completed [`SUBMISSION.md`](./SUBMISSION.md) at the repository root containing:
  - Live production URL & GitHub repository link.
  - Reviewer notes explaining compute wake-up behavior or seed coverage.
  - Verified demo credentials.
  - Goal-by-goal status checklist.
  - Retrospective answers detailing time spent, future roadmap, and engineering trade-offs.

---

## 💻 Local Setup & Development

Follow these steps to run the application locally:

### 1. Clone the repository
```bash
git clone https://github.com/alok-jp/hiring-pipeline.git
cd hiring-pipeline
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

BETTER_AUTH_SECRET="your-secure-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

ADMIN_EMAIL="admin@hirepipe.dev"
ADMIN_PASSWORD="Admin@123"
ADMIN_NAME="Admin User"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="HirePipe <noreply@example.com>"
```

### 4. Database Setup & Prisma Generation
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality & Build Verification

Before committing or pushing changes, verify that the repository passes all automated quality checks:

```bash
# Code formatting
npm run format

# Fast linter (Biome)
npm run lint

# TypeScript compilation check
npx tsc --noEmit

# Production build validation
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
