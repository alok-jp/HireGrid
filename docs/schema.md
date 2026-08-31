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

---

## Relationships

- **One-to-Many**: `User` -> `Session[]`, `User` -> `Account[]`, `User` -> `Invitation[]`.
- **Many-to-Many**: None in the current schema.

---

## Constraints: Database vs. Application Code

- **Database**: Unique constraints (`user.email`, `session.token`, `invitation.tokenHash`) and foreign key cascade deletes.
- **Application Code**: Zod form validation, password strength checks, and role assignment logic.
- **Why**: Database constraints protect storage integrity, while application code provides instant user feedback.

---

## Deliberate Denormalisation

- Stored `role` directly on the `user` table as an enum instead of join tables, avoiding extra joins on every request.

---

## What would break first at 100x the data?

- The `session` table would slow down if expired sessions aren't periodically cleaned up. Adding automated TTL cleanup keeps session lookups fast.
