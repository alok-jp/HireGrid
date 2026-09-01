# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## Setting up Role-Based Auth without Client Privileges

### Prompt
How do I setup role based access control in Better Auth without letting users choose their role during signup

### What you got
I got a suggestion to add `additionalFields` under `user` in `betterAuth` with `input: false` and `defaultValue: "INTERVIEWER"`. But the initial code kept `required: true`, which caused Better Auth's validator to fail signups because the client wasn't submitting a role.

### What you corrected
I set `required: false` on the `role` field in `src/lib/auth.ts` and created a server-side database hook on `user.create.before` to assign the invited role automatically.

---

## Migrating from Resend to Generic SMTP

### Prompt
Replace the entire Resend email integration with a generic SMTP-based email implementation using Nodemailer

### What you got
I uninstalled `resend` and installed `nodemailer`. The initial helper needed structured config validation.

---

## Performance Optimization for Slow Logins

### Prompt
it takes too much time in logging in and the site is very very slow what are your suggestions

### What you got
I analyzed the query waterfall and found that multiple layouts and pages were repeatedly fetching the session from PostgreSQL on a single request.

---

## UI/UX Redesign & Decluttering

### Prompt
Redesign this UI to feel like a premium, highly functional product rather than a dashboard template. Reduce visual noise, establish strong hierarchy, declutter cards, use progressive disclosure, and add subtle micro-interactions.

### What you got
Got a 10-point UI architecture plan to collapse user identity into an avatar menu, convert admin 4-card metrics into a flat typography stat row, remove redundant card borders/buttons, replace stage pills with compact border accents, and add Framer Motion disclosures.
