create table public.countries (code text primary key, name text not null, active boolean not null default false);
create table public.regions (id uuid primary key default gen_random_uuid(), country text not null references public.countries(code), name text not null, unique(country,name));
create table public.support_resources (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null check(category in ('counselling','legal','healthcare','safety','emergency','general')),
 description text not null, location text, phone text, email text, website text, hours text, services text[] not null default '{}',
 verification_status text not null default 'unverified' check(verification_status in ('verified','unverified','demo')), verified_at timestamptz,
 country text not null references public.countries(code), region text, active boolean not null default false, source_url text,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(verification_status <> 'verified' or (verified_at is not null and source_url is not null))
);
create table public.sessions (
 id uuid primary key default gen_random_uuid(), token_hash text not null unique, created_at timestamptz not null default now(), last_activity timestamptz not null default now(), consent_to_followup boolean not null default false, deleted_at timestamptz
);
create table public.support_requests (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id) on delete cascade,
 support_type text not null check(support_type in ('counselling','legal','healthcare','safety','emergency','general')),
 urgency text not null default 'professional_support' check(urgency in ('low','professional_support','immediate_safety')),
 preferred_contact_method text not null check(preferred_contact_method in ('phone','email')),contact_value text not null,name text,preferred_time text,
 consent boolean not null check(consent=true),consent_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','accepted','contacted','completed')),created_at timestamptz not null default now()
);
create index on public.support_requests(session_id);
create index on public.support_requests(status,created_at);
create index on public.support_resources(country,category) where active and verification_status='verified';
alter table public.countries enable row level security;
alter table public.regions enable row level security;
alter table public.support_resources enable row level security;
alter table public.sessions enable row level security;
alter table public.support_requests enable row level security;
revoke all on public.sessions,public.support_requests from anon,authenticated;
grant all on public.sessions,public.support_requests to service_role;
grant select on public.countries,public.regions,public.support_resources to anon,authenticated;
grant all on public.countries,public.regions,public.support_resources to service_role;
create policy "Active countries" on public.countries for select to anon,authenticated using(active);
create policy "Regions of active countries" on public.regions for select to anon,authenticated using(exists(select 1 from public.countries c where c.code=country and c.active));
create policy "Verified public directory" on public.support_resources for select to anon,authenticated using(active and verification_status='verified' and verified_at is not null);
insert into public.countries(code,name,active) values('GH','Ghana',true),('NG','Nigeria',false),('KE','Kenya',false),('UG','Uganda',false),('ZA','South Africa',false);
create table public.confidence_metrics (
 answer text primary key check(answer in ('yes','a_little','not_yet','prefer_not_to_say')),
 responses bigint not null default 0 check(responses>=0)
);
alter table public.confidence_metrics enable row level security;
revoke all on public.confidence_metrics from public,anon,authenticated;
grant select,insert,update on public.confidence_metrics to service_role;
create function public.record_confidence(choice text) returns void
language sql security invoker set search_path = '' as $$
 insert into public.confidence_metrics(answer,responses) values(choice,1)
 on conflict(answer) do update set responses=public.confidence_metrics.responses+1;
$$;
revoke all on function public.record_confidence(text) from public,anon,authenticated;
grant execute on function public.record_confidence(text) to service_role;
