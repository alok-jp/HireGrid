# Plan

Answer each of these, in your own words.

- How did you break the work into sessions?
- What order did you build in, and why that order?
- What did you estimate versus what it actually took?
- What did you cut when you ran short?

---

## How did you break the work into sessions?

I split the work into two logical sessions:

1. **Session 1: Database & Auth Setup**:
   - Setting up the Prisma schema with models for users, sessions, accounts, and verifications.
   - Pushing the schema to Neon PostgreSQL and generating the Prisma Client.
   - Setting up the initial Better Auth config and client files (`auth.ts` and `auth-client.ts`).

2. **Session 2: Auth UI, Routing & Error Debugging**:
   - Building the signup and login forms with React Hook Form and Zod validation.
   - Fixing route layout exports and creating the catch-all API route handler (`/api/auth/[...all]`).


---

## What order did you build in, and why that order?

I built things in this order:

1. **Database Schema & Auth Config first**: Having the data models and auth instance configured up front ensures we have solid types and backend logic in place before wiring up any UI.
2. **API Route Handler second**: Adding the catch-all route handler was essential so client requests would actually reach Better Auth.
3. **UI Components & Forms third**: Connecting the user forms to the auth endpoints was much easier once the backend API was ready and responding.

---

## What did you estimate versus what it actually took?

- **Database and Auth Setup**: Estimated 30 minutes; took about 25 minutes.
- **UI Integration and Route Debugging**: Estimated 45 minutes; took closer to 60 minutes because I had to troubleshoot missing API routes and schema validation conflicts on custom fields.

---

## What did you cut when you ran short?

- I bypassed setting up manual migration files with `prisma migrate dev` and used `prisma db push` instead so I could move faster without wrestling with database drift.
