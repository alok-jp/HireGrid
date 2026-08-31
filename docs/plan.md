# Plan

Answer each of these, in your own words.

- How did you break the work into sessions?
- What order did you build in, and why that order?
- What did you estimate versus what it actually took?
- What did you cut when you ran short?

---

## How did you break the work into sessions?

- **Session 1: Core Setup**: Database schema (User, Session, Account, Invitation), Prisma Client setup, and Better Auth configuration.
- **Session 2: Routes & Forms**: Auth forms, layouts, tRPC invitation endpoints, and SMTP email sending.
- **Session 3: Role Guards & Performance**: Strict layout access control, React `cache()` session deduplication, and database indexing.

---

## What order did you build in, and why that order?

1. **Database Schema & Auth Client first**: Essential foundation for typed data access.
2. **API & tRPC Handlers second**: Backend endpoints required before connecting client forms.
3. **UI Components & Pages third**: Wired up forms once backend endpoints were working.

---

## What did you estimate versus what it actually took?

- **Database & Auth Setup**: Estimated 30 mins; took ~25 mins.
- **UI & Routing**: Estimated 45 mins; took ~60 mins due to fixing missing API routes and linter formats.
- **SMTP Migration & Performance**: Estimated 30 mins; took ~30 mins.

---

## What did you cut when you ran short?

- Used `prisma db push` instead of full migration tracking during initial development to iterate faster.
