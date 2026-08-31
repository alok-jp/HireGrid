# AI prompts

## <What you were trying to achieve>

### Prompt

### What you got

### What you corrected


The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## Setting up Role-Based Auth without Client Privileges

### Prompt
How do I setup role based access control in Better Auth without letting users choose their role during signup

### What you got
I got a suggestion to add `additionalFields` under `user` in `betterAuth` with `input: false` and `defaultValue: "INTERVIEWER"`. But the initial code kept `required: true`, which caused Better Auth's validator to fail signups because the client wasn't submitting a role.

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
