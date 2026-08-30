# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## Setting up Role-Based Auth without Client Privileges

### Prompt
How do I setup role based access control in Better Auth without letting users choose their role during signup

### What you got
I got a suggestion to add custom fields to the user schema using `additionalFields` in Better Auth, setting `input: false` and `defaultValue: "user"`. However, the initial suggestion kept `required: true`, which caused Better Auth's validator to expect the client to submit the role field anyway.

### What you corrected
I changed `required: true` to `required: false` on the `role` field in `src/lib/auth.ts`. This allowed client signups to go through smoothly without sending a role, while still letting the server set the default role to `"user"`.

---
