# Decisions

Log the decisions that actually shaped this codebase — the ones where a real alternative existed and
you picked one. At least five entries. For each: what you chose, what you rejected, and why. At least
one entry must be a decision you later reversed — say what changed your mind. It can be any entry
below, not necessarily the last one; add a **Later reversed:** line to whichever one it is.

## Decision 1

- **Chose:** Better Auth with the Prisma adapter.
- **Rejected:** Rolling custom JWT authentication or using NextAuth / Auth.js.
- **Why:** Better Auth gives us strong TypeScript inference, automatic password hashing, clean session management, and painless Prisma integration without having to write custom token refresh logic.



