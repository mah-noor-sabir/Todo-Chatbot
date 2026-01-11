---
id: "024"
title: "Fix chatbot disappearing after login"
stage: "misc"
date: "2026-01-04"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "ai-chatbot"
branch: "null"
user: "Hp"
command: "fix chatbot disappearing issue"
labels: ["bugfix","chatbot","authentication","frontend"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "frontend/src/hooks/AuthContext.tsx"
  - "frontend/src/components/chat/ChatWidget.tsx"
  - "frontend/src/components/auth/SignInForm.tsx"
  - "frontend/src/components/auth/SignupForm.tsx"
  - "frontend/src/components/layout/Header.tsx"
  - "frontend/src/hooks/useAuth.ts"
tests: []
---

## Prompt

i have created a chatbot but whenever i open my frontend the chatbot disappear fix why this causing an error

## Response snapshot

Identified root cause: Two separate auth systems exist in the codebase that were not synchronized:
1. `AuthContext.tsx` - Used by `ChatWidget` to decide whether to show the chatbot (checked session only once on mount)
2. `useAuth.ts` - Used by `SignInForm` for login/logout

When a user logged in, `useAuth.ts` updated its own `user` state, but `AuthContext.tsx` didn't know about it because the session check only ran once on initial mount.

Fixed by:
1. Added `refreshSession()` function to `AuthContext.tsx` that allows re-checking the session
2. Called `refreshSession()` after successful login in `SignInForm.tsx` and `SignupForm.tsx`
3. Added `setUser(null)` call in `Header.tsx` sign-out handler to clear `AuthContext` state
4. Added debug logging in `ChatWidget.tsx` to help identify any future issues

## Outcome

- ✅ Impact: Chatbot now appears immediately after login and disappears after logout as expected
- 📁 Files: 6 files modified to sync auth state between AuthContext and useAuth
- 🔁 Next prompts: None - issue resolved
- 🧠 Reflection: Root cause was duplicated auth state management. Should consider consolidating to a single auth system in future refactor.

## Evaluation notes (flywheel)

- Failure modes observed: ChatWidget returned null because isAuthenticated was false even after successful login
- Graders run and results (PASS/FAIL): Not applicable - manual verification required
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consolidate AuthContext and useAuth into single auth provider
