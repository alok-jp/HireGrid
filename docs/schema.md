# Schema

Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data?

---

## 1. Table by Table

### `user`
Represents all system users across all roles (Master Admin, Recruiters, and Interviewers).

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `name` | Text | No | — | Full name of the user |
| `email` | Text | No | — | UNIQUE, Indexed (PII, protected by auth & RBAC) |
| `emailVerified` | Boolean | No | `false` | Email verification flag |
| `image` | Text | Yes | `null` | Optional profile image URL |
| `role` | Enum (`Role`) | No | `INTERVIEWER` | Enum: `MASTER_ADMIN`, `RECRUITER`, `INTERVIEWER` |
| `isActive` | Boolean | No | `true` | Soft-delete / account active state |
| `createdAt` | Timestamp | No | `now()` | Account creation timestamp |
| `updatedAt` | Timestamp | No | — | Last update timestamp |

---

### `session`
Better Auth session records mapping authenticated tokens to users.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `expiresAt` | Timestamp | No | — | Session expiration date |
| `token` | Text | No | — | UNIQUE, Indexed (Session secret stored in HTTP-only cookie) |
| `createdAt` | Timestamp | No | `now()` | Session creation timestamp |
| `updatedAt` | Timestamp | No | — | Last update timestamp |
| `ipAddress` | Text | Yes | `null` | Client IP address |
| `userAgent` | Text | Yes | `null` | Browser user-agent string |
| `userId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`) |

---

### `account`
Better Auth authentication credentials storing password hashes and OAuth providers.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `accountId` | Text | No | — | Provider-specific account ID |
| `providerId` | Text | No | — | Auth provider identifier (e.g. `credential`) |
| `userId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`) |
| `accessToken` | Text | Yes | `null` | Optional OAuth token |
| `refreshToken` | Text | Yes | `null` | Optional OAuth refresh token |
| `idToken` | Text | Yes | `null` | Optional OIDC token |
| `accessTokenExpiresAt` | Timestamp | Yes | `null` | OAuth expiration |
| `refreshTokenExpiresAt` | Timestamp | Yes | `null` | Refresh token expiration |
| `scope` | Text | Yes | `null` | OAuth permission scopes |
| `password` | Text | Yes | `null` | Hashed password (Scrypt via Better Auth) |
| `createdAt` | Timestamp | No | `now()` | Account creation timestamp |
| `updatedAt` | Timestamp | No | — | Last update timestamp |

---

### `invitation`
Staff invitations issued by Admins to onboard new Recruiters or Interviewers.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `email` | Text | No | — | Indexed invited email address |
| `role` | Enum (`Role`) | No | — | Role granted upon signup |
| `tokenHash` | Text | No | — | UNIQUE SHA-256 hash of the invitation magic token |
| `expiresAt` | Timestamp | No | — | Indexed token expiration timestamp (7 days) |
| `usedAt` | Timestamp | Yes | `null` | Indexed timestamp when invitation was redeemed |
| `createdAt` | Timestamp | No | `now()` | Invitation issue timestamp |
| `invitedById` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`) |

---

### `job_opening`
Job requisitions created by recruiters.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `title` | Text | No | — | Job title (e.g. Senior Full-Stack Engineer) |
| `department` | Text | No | — | Indexed department (e.g. Engineering, Design) |
| `description` | Text | No | — | Markdown job description and requirements |
| `status` | Enum (`JobOpeningStatus`) | No | `OPEN` | Enum: `OPEN`, `ARCHIVED` (Indexed) |
| `createdAt` | Timestamp | No | `now()` | Indexed creation timestamp |
| `updatedAt` | Timestamp | No | — | Last updated timestamp |

---

### `application`
Core entity tracking a candidate's journey through a job opening.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `candidateName` | Text | No | — | Candidate full name |
| `email` | Text | No | — | Indexed candidate email address |
| `source` | Text | No | — | Indexed application source (e.g. LinkedIn, Referral) |
| `notes` | Text | Yes | `null` | Recruiter internal notes |
| `stage` | Enum (`ApplicationStage`) | No | `APPLIED` | Enum: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED` (Indexed) |
| `stageBeforeRejection` | Enum (`ApplicationStage`) | Yes | `null` | Denormalized prior stage for instant exact reinstatement |
| `stageChangedAt` | Timestamp | No | `now()` | Denormalized timestamp of current stage entry (Indexed for stalled alerts) |
| `hiredAt` | Timestamp | Yes | `null` | Denormalized timestamp when stage became `HIRED` (Indexed for monthly KPIs) |
| `jobOpeningId` | Text | No | — | FK -> `job_opening.id` (`ON DELETE CASCADE`, Indexed) |
| `createdAt` | Timestamp | No | `now()` | Indexed application creation date |
| `updatedAt` | Timestamp | No | — | Indexed update timestamp |

---

### `application_interviewer`
Join table establishing which interviewers are assigned to which candidate application panels.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `applicationId` | Text | No | — | FK -> `application.id` (`ON DELETE CASCADE`), Composite PK |
| `interviewerId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`), Composite PK |
| `createdAt` | Timestamp | No | `now()` | Assignment timestamp |

---

### `application_feedback`
Evaluation scorecards submitted by assigned interviewers for a candidate.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `applicationId` | Text | No | — | FK -> `application.id` (`ON DELETE CASCADE`) |
| `interviewerId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`) |
| `recommendation` | Enum (`Recommendation`) | No | — | Enum: `STRONG_HIRE`, `HIRE`, `NO_HIRE`, `STRONG_NO_HIRE` |
| `technicalRating` | Int | No | `3` | Score from 1 to 5 |
| `communicationRating` | Int | No | `3` | Score from 1 to 5 |
| `problemSolvingRating` | Int | No | `3` | Score from 1 to 5 |
| `comments` | Text | No | — | Detailed qualitative interview evaluation |
| `createdAt` | Timestamp | No | `now()` | Submission timestamp |
| `updatedAt` | Timestamp | No | — | Last edited timestamp |

*Constraint:* `@@unique([applicationId, interviewerId])` guarantees one feedback per interviewer per candidate.

---

### `interview`
Scheduled and conducted interview sessions for an application.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `applicationId` | Text | No | — | FK -> `application.id` (`ON DELETE CASCADE`, Indexed) |
| `scheduledAt` | Timestamp | No | — | Indexed scheduled interview date and time |
| `duration` | Int | Yes | `60` | Scheduled duration in minutes |
| `status` | Enum (`InterviewStatus`) | No | `SCHEDULED` | Enum: `SCHEDULED`, `COMPLETED`, `CANCELLED` (Indexed) |
| `createdAt` | Timestamp | No | `now()` | Creation timestamp |
| `updatedAt` | Timestamp | No | — | Last updated timestamp |

---

### `interview_interviewer`
Join table assigning one or more interviewers to a specific scheduled interview session.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `interviewId` | Text | No | — | FK -> `interview.id` (`ON DELETE CASCADE`), Composite PK |
| `interviewerId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`), Composite PK |

---

### `application_event`
Append-only, immutable audit trail tracking all lifecycle transitions and actions.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `applicationId` | Text | No | — | FK -> `application.id` (`ON DELETE CASCADE`), Indexed |
| `type` | Enum (`ApplicationEventType`) | No | — | Enum: `CREATED`, `STAGE_CHANGED`, `REJECTED`, `REINSTATED`, `FEEDBACK_ADDED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_RESCHEDULED`, `INTERVIEW_CANCELLED` |
| `actorId` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`, Indexed) |
| `oldStage` | Enum (`ApplicationStage`) | Yes | `null` | Prior stage before event |
| `newStage` | Enum (`ApplicationStage`) | Yes | `null` | Target stage after event |
| `interviewId` | Text | Yes | `null` | FK -> `interview.id` (`ON DELETE SET NULL`) |
| `metadata` | Json | Yes | `null` | Denormalized snapshot payload (ratings, comments, dates) |
| `createdAt` | Timestamp | No | `now()` | Indexed event timestamp |

---

### `stalled_application_dismissal`
Tracks recruiter dismissals for stalled applications so alerts stay dismissed until a new stage stall occurs.

| Column | Type | Nullable | Default | Constraints / Purpose |
|---|---|---|---|---|
| `id` | Text | No | `cuid()` | Primary Key |
| `applicationId` | Text | No | — | FK -> `application.id` (`ON DELETE CASCADE`, Indexed) |
| `stage` | Enum (`ApplicationStage`) | No | — | Stage at dismissal time |
| `stageStartedAt` | Timestamp | No | — | Value of `stageChangedAt` when alert was dismissed |
| `dismissedById` | Text | No | — | FK -> `user.id` (`ON DELETE CASCADE`) |
| `dismissedAt` | Timestamp | No | `now()` | Dismissal timestamp |

*Constraint:* `@@unique([applicationId, stage, stageStartedAt])` prevents duplicate dismissals for the same stage stall period.

---

## 2. Relationships: One-to-Many vs. Many-to-Many

### One-to-Many Relationships (1:N)
1. **`JobOpening` → `Application`**: A single job requisition receives many candidate applications, but each application strictly applies to exactly one job opening.
2. **`User` → `Session`**: A single user can have active sessions across multiple devices or browsers simultaneously.
3. **`User` → `Account`**: A user has their authentication provider credentials.
4. **`User` → `Invitation`**: An admin user can issue multiple invitation links to new team members.
5. **`Application` → `Interview`**: A candidate application progresses through multiple interview rounds (screening call, technical panel, executive chat) across its lifecycle.
6. **`Application` → `ApplicationFeedback`**: Multiple interviewers independently submit scorecard evaluations for the same application.
7. **`Application` → `ApplicationEvent`**: A candidate accumulates an append-only sequence of immutable lifecycle events.
8. **`Application` → `StalledApplicationDismissal`**: Recruiters can dismiss stalled alerts for an application across different stages over time.

### Many-to-Many Relationships (M:N)
1. **`Application` ↔ `User` (Interviewer Panel)**:
   - *Why*: A candidate application requires an interview panel composed of multiple interviewers. Conversely, any interviewer sits on interview panels across many different candidates and job requisitions.
   - *Implementation*: Explicit join table `application_interviewer` with composite primary key `(applicationId, interviewerId)`.
2. **`Interview` ↔ `User` (Interview Session Interviewers)**:
   - *Why*: A single scheduled interview session can be conducted by a panel of multiple interviewers (e.g., paired technical interviews), and an interviewer participates in many interview sessions over time.
   - *Implementation*: Explicit join table `interview_interviewer` with composite primary key `(interviewId, interviewerId)`.

---

## 3. Database vs. Application Constraints & Why the Line Was Drawn There

### Enforced by the Database
- **Primary & Foreign Key Constraints (`ON DELETE CASCADE`)**: Cascading deletions clean up sessions, panel assignments, interviews, and feedback when a parent entity is deleted.
- **Unique Constraints**:
  - `user.email`: Uniqueness prevents account duplication at the database level.
  - `invitation.tokenHash`: Guarantees token hashes cannot collide.
  - `application_interviewer(applicationId, interviewerId)` composite PK: Prevents assigning the same interviewer twice to the same candidate panel.
  - `interview_interviewer(interviewId, interviewerId)` composite PK: Prevents assigning the same interviewer twice to the same interview time slot.
  - `application_feedback(applicationId, interviewerId)` unique constraint: Guarantees each interviewer can submit only one formal feedback review per candidate.
  - `stalled_application_dismissal(applicationId, stage, stageStartedAt)` unique constraint: Prevents duplicate dismissal records for the same stage period.

### Enforced by Application Code
- **Sequential Stage Machine (`APPLIED → SCREENING → INTERVIEW → OFFER → HIRED`)**: The database schema uses an enum which technically permits any stage transition. Application domain logic in `src/lib/pipeline-service.ts` strictly rejects illegal skips (e.g., `APPLIED` straight to `OFFER`) or moving already `HIRED` candidates.
- **Role-Based Authorization (RBAC)**: Enforced via tRPC procedure middleware (`recruiterProcedure`, `interviewerProcedure`, `adminProcedure`). The database merely stores raw role strings; application code verifies that interviewers can only access candidates assigned to them.
- **Interviewer Assignment Role Guard**: Application code verifies that only users with `role: INTERVIEWER` can be added to an interview panel before inserting into the join table.
- **Interview Prerequisite for Offers**: The server checks that an application has at least one completed interview before permitting advancement from `INTERVIEW` to `OFFER`.
- **Interviewer Double-Booking Detection**: Application logic verifies that an interviewer does not have an existing scheduled interview overlapping with a proposed time window (`scheduledAt` ± `duration`).

### Why We Drew the Line There
- **Database constraints handle inviolable relational invariants and structural integrity**: Duplicated email addresses, duplicate panel assignments, or orphaned foreign key rows represent permanent data corruption. The database engine enforces these atomically regardless of whether mutations originate from web procedures, scripts, or manual SQL migrations.
- **Application code handles temporal business rules, multi-table prerequisites, and user-facing policy errors**: Rules such as "must have completed at least one interview before offer" or "interviewer can only view assigned candidates" involve multi-table context, conditional logic, and require clear, actionable error messages returned to the user interface.

---

## 4. What Was Deliberately Denormalised

1. **`Application.stageBeforeRejection`**:
   - *Why*: When a candidate is rejected, we save the stage they occupied prior to rejection directly on the `Application` record. While this could theoretically be deduced by scanning backwards through `ApplicationEvent` audit rows, storing it directly allows instant $O(1)$ reinstatement back to their exact prior stage without executing complex historical subqueries.
2. **`Application.stageChangedAt`**:
   - *Why*: Storing the timestamp when the current stage began directly on the `Application` row allows the stalled alert engine to execute an efficient indexed query (`WHERE stageChangedAt < NOW() - INTERVAL '10 days'`) in $O(1)$ time rather than computing a costly `GROUP BY application_id / MAX(createdAt)` aggregate over millions of historical events.
3. **`Application.hiredAt`**:
   - *Why*: Storing the explicit hiring timestamp directly on the candidate row enables the executive dashboard to calculate monthly hires via a fast B-tree index range scan (`WHERE hiredAt >= startOfMonth`) instead of joining and filtering historical audit events.
4. **`ApplicationEvent.metadata` (JSON Snapshot)**:
   - *Why*: We denormalize evaluation ratings, comments, and interview details directly into the audit event payload. This guarantees that the audit log remains a permanent, self-contained, and unalterable record that remains accurate even if the original feedback or user record is later updated or removed.

---
## 5. What Would Break First at 100x Data

At significantly larger data volumes, the first major weakness is **not authentication sessions**. The more immediate risk is the application's handling of large, unbounded data operations.

### 1. Unbounded CSV Export — First Major Failure Point

The CSV export is the most significant scalability concern.

The current implementation retrieves a large number of application records at once, processes them in application memory, builds a single CSV response, and sends the entire result back to the client.

As the number of applications grows, this causes three problems:

* increasing database work
* increasing Node.js memory usage and garbage collection
* increasingly large network responses

At production-scale data volumes, this can turn an otherwise normal operation into a slow or resource-intensive request.

### 2. Dashboard Aggregations

The dashboard is another area that becomes increasingly expensive as historical application data grows.

Metrics such as application trends, stage distributions, department statistics, and stalled applications require aggregation across a growing dataset. Performing these calculations repeatedly during dashboard requests increases database and application workload.

### 3. Connection and Request Bursts

The application can also experience increased latency during sudden bursts of concurrent requests.

This is particularly relevant in a serverless environment, where multiple application instances may need database connections at approximately the same time. Connection pooling helps, but burst traffic can still introduce request queueing and additional latency.

This is more of a **concurrency-management concern** than a fundamental authentication failure.

### 4. Authentication Sessions Remain Relatively Resilient

Database-backed authentication sessions are not the primary scalability concern identified here.

Because session-token lookups use an indexed unique key, the database can efficiently locate an individual session without scanning the entire session table. The important consideration is therefore not simply "database sessions are used," but how efficiently the database connections and queries are managed under concurrent traffic.
