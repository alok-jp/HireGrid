# HirePipe — Modern End-to-End Hiring Pipeline

A full-stack, enterprise-ready hiring pipeline application built with **Next.js 16 (App Router)**, **tRPC v11**, **Prisma ORM**, **Better Auth**, **PostgreSQL (Neon)**, and **Biome**.

HirePipe centralizes recruiting workflows, candidate stage progressions, multi-interviewer panel assignments, structured evaluation feedback, real-time stalled alerts, and immutable audit logging into a single cohesive, high-performance platform.

---

## 🚀 Live Demo & Repository

- **Live Application:** [https://hiregrid-phi.vercel.app/](https://hiregrid-phi.vercel.app/)
- **GitHub Repository:** [https://github.com/alok-jp/hiring-pipeline/](https://github.com/alok-jp/hiring-pipeline/)

---

## 🔑 Simple Demo Credentials

All test accounts use simple credentials for easy reviewer evaluation:

| Role | Name | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Master Admin** | Admin User | `admin@hirepipe.dev` | `Admin@123` | Full system control, user directory, system settings, invitations |
| **Recruiter** | Rachel Vance | `recruiter@hirepipe.dev` | `Password123!` | Create/archive jobs, manage all applications, advance/reject, assign interviewers, export CSV, view dashboard |
| **Recruiter (Alt)** | Samira Khan | `recruiter2@hirepipe.dev` | `Password123!` | Full recruiter permissions, candidate pipeline & alert triage |
| **Interviewer** | Ian Mercer | `interviewer@hirepipe.dev` | `Password123!` | View assigned applications, schedule/conduct interviews, submit structured feedback |
| **Interviewer (Alt)** | Maya Lin | `interviewer2@hirepipe.dev` | `Password123!` | View assigned candidates, scorecard evaluations, interview panel access |

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose & Why Chosen |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + React 19 | Server-side rendering, React Server Components, streaming, and modern routing. |
| **API Layer** | [tRPC v11](https://trpc.io/) + TanStack Query v5 | End-to-end type safety between database schema and client UI without manual API contracts or code generation. |
| **Database & ORM** | [Prisma ORM 7](https://www.prisma.io/) + [Neon PostgreSQL](https://neon.tech/) | Strict relational data integrity, migration workflows, relational indexes, and connection pooling. |
| **Authentication** | [Better Auth v1.7](https://better-auth.com/) | Robust session management, server-side RBAC enforcement, secure password hashing, and invitation flows. |
| **Validation** | [Zod v4](https://zod.dev/) | Strict input validation on all mutations, form submissions, and query parameters. |
| **Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI / Shadcn](https://ui.shadcn.com/) | Accessible, responsive, accessible dark/light mode, and custom glassmorphism aesthetic. |
| **Data Visualization** | [Recharts](https://recharts.org/) | Responsive metrics, quarterly application volume trend lines, and stage breakdown charts. |
| **Linter & Formatter** | [Biome 2.4](https://biomejs.dev/) | Sub-100ms ultra-fast linting, formatting, and strict type/import checking. |

---

## 🎯 10 Core Assignment Requirements Implemented

### 1. Accounts and Roles (RBAC Enforced on Server)
- Three distinct roles: `MASTER_ADMIN`, `RECRUITER`, and `INTERVIEWER`.
- Strict middleware (`recruiterProcedure`, `interviewerProcedure`, `adminProcedure`) verifies user permissions server-side.
- Interviewers are strictly restricted to assigned candidates; any direct attempt to fetch or modify unauthorized applications returns a `403 FORBIDDEN` TRPCError.

### 2. Job Openings
- Full CRUD for job requisitions (Title, Department, Description, Status).
- Soft archive (`ARCHIVED`) and restore flows.
- Archiving hides requisitions from standard views while preserving all associated candidate applications and historical logs.

### 3. Applications Inside Job Openings
- Every application belongs to exactly one job opening.
- Fields: Candidate Name, Email, Source, Notes, Stage, Timestamps.
- Direct links between job opening workspaces and candidate detail views.

### 4. Strict Pipeline Stage Rules
- Allowed stage order: `APPLIED` → `SCREENING` → `INTERVIEW` → `OFFER` → `HIRED`.
- Advancing is strictly 1-step-at-a-time, calculated server-side without accepting client-provided target stages.
- Rejection (`REJECTED`) is allowed from any stage and automatically captures `stageBeforeRejection`.
- Reinstatement returns the candidate directly back to their exact previous stage (not reset to `APPLIED`).
- Invalid stage jumps (e.g. `SCREENING` → `OFFER`) or advancing `HIRED` candidates are rejected by the server with descriptive error messages.
- Advancing from `INTERVIEW` to `OFFER` requires at least one completed interview evaluation.

### 5. Multi-Interviewer Panel
- Any number of interviewers can be assigned to an application.
- Interviewers can be on panels across multiple requisitions.
- Only users with `Role.INTERVIEWER` can be assigned to interview panels.
- Dedicated Interviewer workspace (`/interviewer`) displays only assigned applications and interview schedules.

### 6. Server-Side Candidate Search, Filtering & Pagination
- Comprehensive search over candidate name and email.
- Server-side filters by Job Opening, Stage, and Source.
- Server-side sorting by Created Date, Stage, or Last Updated.
- Server pagination using PostgreSQL `skip` / `take` with total match counts (no heavy in-browser filtering).

### 7. Bulk Actions & Pipeline CSV Export
- Multi-select candidates to bulk advance or bulk reject.
- Per-candidate outcome reporting: provides granular feedback on which candidates succeeded and which were refused (with detailed reason) rather than failing the batch.
- Server-generated CSV snapshot of all open applications with proper double-quote and comma escaping.

### 8. Executive Recruiting Dashboard
- Headline KPIs: Open Positions, Active Applications, Interviews Scheduled This Week, Hires This Month.
- Live candidate breakdowns by stage and job opening.
- Rolling 12-week quarterly application volume trend line chart using Recharts.
- Quick navigation to filtered candidate subsets directly from KPI cards.

### 9. Immutable Audit History & Event Timeline
- Dedicated `ApplicationEvent` log tracks all activities: application creation, stage progressions (old vs new stage + actor), rejections, reinstatements, scheduled interviews, and evaluations.
- Read-only access: router strictly exposes NO update or delete mutations for audit events.
- Accessible vertical timeline in candidate workspaces showing timestamps, actors, and diffs.

### 10. Stalled Application Alerts & Threshold Logic
- Automatic detection of any candidate remaining in the same stage for more than 10 days (`stageChangedAt`).
- Badge counter in the top navigation header for immediate recruiter visibility.
- Recruiters can dismiss alerts for a specific application stage period.
- Stage progression resets the timer; if the candidate subsequently stalls for >10 days in the new stage, a new alert is triggered automatically.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/alok-jp/hiring-pipeline.git
cd hiring-pipeline
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

BETTER_AUTH_SECRET="your-32-character-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

ADMIN_EMAIL="admin@hirepipe.dev"
ADMIN_PASSWORD="Admin@123"
ADMIN_NAME="Admin User"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="app-password"
SMTP_FROM="HirePipe <noreply@example.com>"
```

### 4. Push Database Schema & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Code Quality & Verification

Run static type checking, code formatting, and Biome linting:

```bash
# Run static type checking
npx tsc --noEmit

# Run Biome fast linter
npm run lint

# Build production application bundle
npm run build
```

---

## 📝 Methodology & Productivity Note

In this project, I used the official documentation for the implementation of the libraries (Next.js 16 App Router, Prisma ORM, Better Auth, tRPC v11, TanStack Query, Radix UI, Recharts, and Biome) to ensure correct architectural patterns, and used the VS Code auto complete feature to accelerate repetitive tasks.
