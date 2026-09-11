create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_sessions(id) on delete cascade,
  contact_method text not null check (contact_method in ('phone', 'email')),
  contact_value text not null,
  consent boolean not null default false check (consent = true),
  created_at timestamptz not null default now()
);
alter table public.contact_requests enable row level security;
revoke all on public.contact_requests from anon, authenticated;
grant all on public.contact_requests to service_role;
create index contact_requests_session_idx on public.contact_requests(session_id, created_at desc);
