# Schema

Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data?

---

## Tables

### 1. `user`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `name` | Text | No | — | — |
| `email` | Text | No | — | UNIQUE, Index |
| `emailVerified` | Boolean | No | `false` | — |
| `image` | Text | Yes | `null` | — |
| `role` | Enum (`Role`) | No | `INTERVIEWER` | — |
| `createdAt` | Timestamp | No | `now()` | — |
| `updatedAt` | Timestamp | No | — | — |

- **Sensitive Data**: `email` (PII). Protected via HTTPS, authentication session guards, and access-controlled tRPC procedures.

---

### 2. `session`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `expiresAt` | Timestamp | No | — | — |
| `token` | Text | No | — | UNIQUE, Index |
| `createdAt` | Timestamp | No | `now()` | — |
| `updatedAt` | Timestamp | No | — | — |
| `ipAddress` | Text | Yes | `null` | — |
| `userAgent` | Text | Yes | `null` | — |
| `userId` | Text | No | — | FK -> `user.id` (CASCADE) |

- **Sensitive Data**: `token` (Session Secret). Stored as secure HTTP-only cookies in browser, indexed in database for quick session validation.

---

### 3. `account`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `accountId` | Text | No | — | — |
| `providerId` | Text | No | — | — |
| `userId` | Text | No | — | FK -> `user.id` (CASCADE) |
| `password` | Text | Yes | `null` | Password hash |

- **Sensitive Data**: `password` (Hashed Credential). Hashed automatically using Scrypt by Better Auth before storing. Never exposed in API responses.

---

### 4. `invitation`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `email` | Text | No | — | Index |
| `role` | Enum (`Role`) | No | — | — |
| `tokenHash` | Text | No | — | UNIQUE |
| `expiresAt` | Timestamp | No | — | Index |
| `usedAt` | Timestamp | Yes | `null` | Index |
| `createdAt` | Timestamp | No | `now()` | — |
| `invitedById` | Text | No | — | FK -> `user.id` (CASCADE) |

- **Sensitive Data**: `tokenHash` (Invitation Secret). Hashed using SHA-256 before saving to DB. Magic link emails contain raw token; DB only holds hash.

---

### 5. `job_opening`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `title` | Text | No | — | — |
| `department` | Text | No | — | Index |
| `description` | Text | No | — | — |
| `status` | Enum (`JobOpeningStatus`) | No | `OPEN` | Index |
| `createdAt` | Timestamp | No | `now()` | Index |
| `updatedAt` | Timestamp | No | — | — |

---

### 6. `application`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `candidateName` | Text | No | — | — |
| `email` | Text | No | — | Index |
| `source` | Text | No | — | Index |
| `notes` | Text | Yes | `null` | — |
| `stage` | Enum (`ApplicationStage`) | No | `APPLIED` | Index |
| `stageBeforeRejection` | Enum (`ApplicationStage`) | Yes | `null` | — |
| `jobOpeningId` | Text | No | — | FK -> `job_opening.id` (CASCADE), Index |
| `createdAt` | Timestamp | No | `now()` | Index |
| `updatedAt` | Timestamp | No | — | Index |

- **Indexes**: `@@index([jobOpeningId])`, `@@index([email])`, `@@index([stage])`, `@@index([source])`, `@@index([createdAt])`, `@@index([updatedAt])`, `@@index([jobOpeningId, stage])`.

---

### 7. `application_interviewer`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `applicationId` | Text | No | — | FK -> `application.id` (CASCADE), PK |
| `interviewerId` | Text | No | — | FK -> `user.id` (CASCADE), PK |
| `createdAt` | Timestamp | No | `now()` | — |

- **Primary Key**: `@@id([applicationId, interviewerId])` composite key.
- **Indexes**: `@@index([applicationId])`, `@@index([interviewerId])`.

---

### 8. `application_feedback`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | PK |
| `applicationId` | Text | No | — | FK -> `application.id` (CASCADE) |
| `interviewerId` | Text | No | — | FK -> `user.id` (CASCADE) |
| `recommendation` | Enum (`Recommendation`) | No | — | `STRONG_HIRE`, `HIRE`, `NO_HIRE`, `STRONG_NO_HIRE` |
| `technicalRating` | Int | No | `3` | 1–5 score |
| `communicationRating` | Int | No | `3` | 1–5 score |
| `problemSolvingRating` | Int | No | `3` | 1–5 score |
| `comments` | Text | No | — | Detailed text feedback |
| `createdAt` | Timestamp | No | `now()` | — |
| `updatedAt` | Timestamp | No | — | — |

- **Unique Constraint**: `@@unique([applicationId, interviewerId])`.
- **Indexes**: `@@index([applicationId])`, `@@index([interviewerId])`.
