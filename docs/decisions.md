# Decisions

Log the decisions that actually shaped this codebase — the ones where a real alternative existed and
you picked one. At least five entries. For each: what you chose, what you rejected, and why. At least
one entry must be a decision you later reversed — say what changed your mind. It can be any entry
below, not necessarily the last one; add a **Later reversed:** line to whichever one it is.

## Decision 1

- **Chose:** Better Auth with `@better-auth/prisma-adapter`.
- **Rejected:** Custom JWT authentication or NextAuth.
- **Why:** Better Auth gives clean session management, automatic password hashing, and strong TypeScript type inference out of the box.

## Decision 2

- **Chose:** Server-side role assignment via database hooks (`input: false`).
- **Rejected:** Letting users choose their own role during signup.
- **Why:** Prevents malicious users from self-assigning `MASTER_ADMIN` or `RECRUITER` privileges.

## Decision 3

- **Chose:** Generic SMTP via Nodemailer.
- **Rejected:** Provider-locked SDKs like Resend or SendGrid.
- **Later reversed:** Started with Resend, but switched to generic SMTP so the app works with any mail server via standard environment variables also the resend was taking time to verify the domain.
- **Why:** Allows zero-code-change switching between email providers in development and production.

## Decision 4

- **Chose:** React `cache()` session memoization.
- **Rejected:** Fetching sessions independently in every layout and page component.
- **Why:** Dedupes DB session lookups within a single HTTP request, cutting load times significantly.

## Decision 5

- **Chose:** `prisma db push` during active development.
- **Rejected:** Generating migration files with `prisma migrate dev` on every schema change.
- **Why:** Speeds up rapid schema iterations without getting blocked by migration drift prompts.

## Decision 6

- **Chose:** Next.js Server Component Layout Guards (`layout.tsx` role check + `redirect()`).
- **Rejected:** Solely relying on client-side routing hooks or dedicated standalone API routing wrappers for page-level access control.
- **Why:** Server layouts execute before page rendering, preventing unauthorized HTML payload delivery, eliminating client-side layout flashing, and keeping route protection clean and collocated.

## Decision 7

- **Chose:** Composite Primary Key Join Table (`ApplicationInterviewer` with `@@id([applicationId, interviewerId])`).
- **Rejected:** Single `interviewerId` field on `Application` or unconstrained array fields.
- **Why:** Enforces many-to-many relationship where applications can have multiple interviewers and interviewers can evaluate multiple applications across positions without duplicate records.

## Decision 8

- **Chose:** Server-side search, multi-field filtering, whitelisted sorting, and transactional pagination in PostgreSQL via Prisma.
- **Rejected:** Client-side array filtering in React or introducing external search clusters (Elasticsearch / Algolia).
- **Why:** Prevents transferring unneeded rows over the network, maintains strict interviewer authorization boundaries at the database query level, and scales efficiently for large datasets without adding operational overhead.

## Decision 9

- **Chose:** Direct in-memory CSV string generation via tRPC procedure (`application.exportCsv`).
- **Rejected:** Streaming CSV responses (e.g., Node.js `stream.Readable`, Web Streams API, or chunked transfer encoding).
- **Why:** Keeps the implementation simple, fast, and maintainable for assignment-scale candidate exports. Direct string building formats database records cleanly into an escaped CSV string returned in the JSON payload, avoiding stream pipeline overhead and complex HTTP chunk handling while ensuring only authorized records are exported.

## Decision 10

- **Chose:** Independent per-candidate bulk evaluation with detailed success/refusal reporting.
- **Rejected:** Single `updateMany()` database operations or atomic transactions that roll back the entire batch if one candidate fails.
- **Why:** Selected candidates may be at different pipeline stages. Independent evaluation allows valid pipeline advances to succeed while returning explicit refusal reasons for ineligible candidates (e.g. already HIRED or REJECTED).
