# Schema

Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data?

---

## Table by table: columns and types

### `user`
- `id`: String (cuid, primary key)
- `name`: String
- `email`: String (unique)
- `emailVerified`: Boolean (default: false)
- `image`: String (optional)
- `role`: Role Enum (`MASTER_ADMIN`, `RECRUITER`, `INTERVIEWER`, default: `INTERVIEWER`)
- `createdAt`, `updatedAt`: DateTime

### `session`
- `id`: String (cuid, primary key)
- `expiresAt`: DateTime
- `token`: String (unique)
- `ipAddress`, `userAgent`: String (optional)
- `userId`: String (foreign key -> `user.id`, cascade delete)
- `createdAt`, `updatedAt`: DateTime

### `account`
- `id`: String (cuid, primary key)
- `accountId`, `providerId`: String
- `userId`: String (foreign key -> `user.id`, cascade delete)
- `accessToken`, `refreshToken`, `idToken`, `password`: String (optional)
- `createdAt`, `updatedAt`: DateTime

### `verification`
- `id`: String (cuid, primary key)
- `identifier`, `value`: String
- `expiresAt`: DateTime
- `createdAt`, `updatedAt`: DateTime (optional)

### `invitation`
- `id`: String (cuid, primary key)
- `email`: String
- `role`: Role Enum
- `tokenHash`: String (unique)
- `expiresAt`: DateTime
- `usedAt`: DateTime (optional)
- `invitedById`: String (foreign key -> `user.id`, cascade delete)
- `createdAt`: DateTime

### `job_opening` (`JobOpening`)
- `id`: String (cuid, primary key)
- `title`: String
- `department`: String
- `description`: String
- `status`: JobOpeningStatus Enum (`OPEN`, `ARCHIVED`, default: `OPEN`)
- `createdAt`, `updatedAt`: DateTime

### `application` (`Application`)
- `id`: String (cuid, primary key)
- `candidateName`: String
- `email`: String
- `source`: String
- `notes`: String (optional)
- `stage`: String (default: "Applied")
- `jobOpeningId`: String (foreign key -> `job_opening.id`, cascade delete)
- `createdAt`, `updatedAt`: DateTime

---

## Relationships

- **One-to-Many**:
  - `User` -> `Session[]`
  - `User` -> `Account[]`
  - `User` -> `Invitation[]`
  - `JobOpening` -> `Application[]` (Cascade delete when job opening is removed)
- **Many-to-Many**:
  - Interview panel assignments (interviewers assigned to applications).

---

## Constraints: Database vs. Application Code

- **Database**: Primary keys, foreign key relations, unique constraints (`user.email`, `session.token`, `invitation.tokenHash`), status enums (`Role`, `JobOpeningStatus`), cascade deletes, and indexes on `job_opening.status`, `application.jobOpeningId`, and `application.email`.
- **Application Code**: Zod form validation, role authorization middleware (`recruiterProcedure`, `adminProcedure`), and stage transition logic.
- **Why**: Database constraints protect storage integrity, while application code provides instant user feedback.

---

## Deliberate Denormalisation

- Stored `role` directly on `user` and `status` directly on `job_opening` as enums instead of join tables, avoiding extra joins on every request.

---

## What would break first at 100x the data?

- Searching large application datasets across candidate name and email text without full-text search indexes. Adding PostgreSQL GIN / Trigram indexes on `candidateName` and `email` ensures sub-10ms search at scale.
