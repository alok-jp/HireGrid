# Schema

Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data?

---

## Table by table: what columns and types does each one have?

### `user` Table
- `id`: String (cuid, primary key)
- `name`: String
- `email`: String (unique)
- `emailVerified`: Boolean (defaults to false)
- `image`: Optional String
- `createdAt`: DateTime (defaults to current time)
- `updatedAt`: DateTime (updated automatically)
- `role`: Optional String (defaults to `"user"`)

### `session` Table
- `id`: String (cuid, primary key)
- `expiresAt`: DateTime
- `token`: String (unique)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `ipAddress`: Optional String
- `userAgent`: Optional String
- `userId`: String (foreign key to `user.id`, cascades on delete)

### `account` Table
- `id`: String (cuid, primary key)
- `accountId`: String
- `providerId`: String
- `userId`: String (foreign key to `user.id`, cascades on delete)
- `accessToken`, `refreshToken`, `idToken`: Optional Strings
- `accessTokenExpiresAt`, `refreshTokenExpiresAt`: Optional DateTimes
- `password`: Optional String (hashed password)
- `createdAt`, `updatedAt`: DateTimes

### `verification` Table
- `id`: String (cuid, primary key)
- `identifier`: String
- `value`: String
- `expiresAt`: DateTime
- `createdAt`, `updatedAt`: Optional DateTimes

---

## Which relationships are one-to-many, and which are many-to-many?

- **One-to-Many**:
  - `User` -> `Session`: One user can have multiple active session records across different devices.
  - `User` -> `Account`: One user can link multiple login accounts or OAuth providers.
- **Many-to-Many**:
  - None required for the authentication schema right now.

---

## Which constraints are enforced by the database, and which by application code — and why did you draw the line there?

- **Database Constraints**: Email uniqueness on `user`, token uniqueness on `session`, and cascading deletions on user ID foreign keys.
- **Application Code Constraints**: Form field formatting rules (valid email syntax, minimum password length), matching password confirmation, and assigning default `"user"` roles on signup.
- **Why draw the line there?**: Critical data integrity rules (like unique emails and foreign key cleanup) belong in the database so invalid data can never be written. Input formatting and UX feedback belong in application code to give instant feedback before hitting the database.

---

## What did you deliberately denormalise?

I kept `role` as a simple string column directly on the `user` table instead of creating separate `roles` and `user_roles` tables. Since our permissions are straightforward (`user` vs `admin`), storing the role directly avoids unnecessary database joins on every request.

---

## What would break first if this had 100x the data?

The `session` table would grow very large and slow down lookups if expired sessions accumulate over time without automated cleanup. Adding an index on `expiresAt` and running a background cleanup job would be essential at scale.
