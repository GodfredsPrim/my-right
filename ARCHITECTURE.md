# MY RIGHT architecture

MY RIGHT is a Next.js App Router application with Supabase as the source of truth for sessions, conversations, cases, staff, resources, and audit events.

## Boundaries

- Public routes can start an anonymous session without account creation.
- Sensitive operations belong in server routes or Supabase Edge Functions.
- `lib/ai/provider.ts` is the vendor-neutral AI boundary. Provider credentials never belong in browser code.
- Evidence belongs in private Storage buckets and is accessed through short-lived signed URLs.
- Staff and admin access is checked from trusted server/database context, never from client role state.

## First vertical slice

The public landing, support shell, and emergency pathway are implemented. The migration establishes the core entities and RLS posture. The next implementation step is wiring Supabase clients, consent records, and server actions for session/message/case creation.