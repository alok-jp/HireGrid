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
