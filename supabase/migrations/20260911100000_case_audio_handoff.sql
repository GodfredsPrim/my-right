alter table public.support_attachments add column if not exists case_id uuid references public.cases(id) on delete set null;
alter table public.support_attachments add column if not exists transcript text;
alter table public.support_attachments add column if not exists transcript_status text not null default 'not_requested' check (transcript_status in ('not_requested', 'processing', 'ready', 'failed'));
create index if not exists support_attachments_case_idx on public.support_attachments(case_id, created_at desc);

create or replace function public.claim_case(case_id uuid, staff_id uuid)
returns public.cases
language plpgsql
security invoker
set search_path = public
as $$
declare
  claimed public.cases;
  staff_role text;
begin
  select role into staff_role from public.staff_members where id = staff_id and active = true;
  update public.cases
  set status = 'assigned', updated_at = now()
  where id = case_id
    and status in ('new', 'awaiting_assignment')
    and (
      (category = 'legal' and staff_role in ('lawyer', 'human_rights'))
      or (category = 'counselling' and staff_role = 'counsellor')
      or (category = 'healthcare' and staff_role = 'healthcare')
      or (category in ('safety', 'emergency') and staff_role = 'safety_worker')
      or (category = 'general' and staff_role in ('lawyer', 'human_rights', 'counsellor', 'healthcare', 'safety_worker'))
    )
  returning * into claimed;
  if claimed.id is not null then
    insert into public.case_assignments(case_id, staff_id) values (claimed.id, staff_id)
    on conflict (case_id) do nothing;
  end if;
  return claimed;
end;
$$;
revoke all on function public.claim_case(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_case(uuid, uuid) to service_role;
