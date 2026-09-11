create or replace function public.claim_support_request(request_id uuid, staff_id uuid)
returns public.support_requests
language plpgsql
security invoker
set search_path = public
as $$
declare
  claimed public.support_requests;
  staff_role text;
begin
  select role into staff_role from public.staff_members where id = staff_id and active = true;
  update public.support_requests
  set claimed_by = staff_id, claimed_at = now(), status = 'accepted'
  where id = request_id
    and status = 'pending'
    and claimed_by is null
    and (
      (support_type in ('legal') and staff_role in ('lawyer', 'human_rights'))
      or (support_type = 'counselling' and staff_role = 'counsellor')
      or (support_type = 'healthcare' and staff_role = 'healthcare')
      or (support_type in ('safety', 'emergency') and staff_role = 'safety_worker')
      or (support_type = 'general' and staff_role in ('lawyer', 'human_rights', 'counsellor', 'healthcare', 'safety_worker'))
    )
  returning * into claimed;
  return claimed;
end;
$$;
