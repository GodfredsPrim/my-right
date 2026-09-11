create table public.staff_members (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check (char_length(full_name) between 2 and 120),
 email text not null unique,
 organisation text not null check (char_length(organisation) between 2 and 160),
 role text not null check (role in ('lawyer','human_rights','counsellor','healthcare','safety_worker','admin')),
 token_hash text not null unique,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 last_seen_at timestamptz
);
alter table public.support_requests add column if not exists claimed_by uuid references public.staff_members(id) on delete set null;
alter table public.support_requests add column if not exists claimed_at timestamptz;
create index if not exists support_requests_claimed_by_idx on public.support_requests(claimed_by);
create index if not exists staff_members_active_role_idx on public.staff_members(active, role);
alter table public.staff_members enable row level security;
revoke all on public.staff_members from public, anon, authenticated;
grant all on public.staff_members to service_role;
create or replace function public.claim_support_request(request_id uuid, staff_id uuid)
returns public.support_requests
language plpgsql
security invoker
set search_path = public
as $$
declare claimed public.support_requests;
begin
  update public.support_requests
  set claimed_by = staff_id, claimed_at = now(), status = 'accepted'
  where id = request_id and status = 'pending' and claimed_by is null
  returning * into claimed;
  return claimed;
end;
$$;
revoke all on function public.claim_support_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_support_request(uuid, uuid) to service_role;
