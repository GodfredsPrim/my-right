create extension if not exists "pgcrypto";
create type public.staff_role as enum ('super_admin', 'admin', 'lawyer', 'counselor', 'social_worker', 'safeguarding_officer', 'support_staff');
create type public.verification_status as enum ('pending', 'verified', 'suspended', 'rejected');
create type public.case_status as enum ('new', 'awaiting_assignment', 'assigned', 'contact_attempted', 'in_follow_up', 'awaiting_user', 'referred', 'escalated', 'resolved', 'closed');
create type public.risk_level as enum ('none', 'low', 'medium', 'high', 'urgent');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references public.profiles(id) on delete cascade,
  role public.staff_role not null,
  full_name text not null,
  professional_title text,
  organization text,
  specialties text[] not null default '{}',
  verification_status public.verification_status not null default 'pending',
  availability_status text not null default 'offline',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.support_sessions (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_hash text not null unique,
  status text not null default 'active',
  consent_version text,
  privacy_notice_version text,
  emergency_flag boolean not null default false,
  human_followup_requested boolean not null default false,
  contact_method text,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_sessions(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_sessions(id),
  status public.case_status not null default 'new',
  priority public.risk_level not null default 'low',
  category text,
  reference_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.case_assignments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id),
  assigned_at timestamptz not null default now()
);
create table public.ai_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  immediate_danger boolean not null default false,
  potential_risk public.risk_level not null default 'none',
  child_safety_concern boolean not null default false,
  violence_concern boolean not null default false,
  coercion_concern boolean not null default false,
  harassment_concern boolean not null default false,
  self_harm_concern boolean not null default false,
  professional_support_recommended boolean not null default false,
  emergency_pathway_recommended boolean not null default false,
  confidence numeric(4,3) check (confidence >= 0 and confidence <= 1),
  rationale text,
  created_at timestamptz not null default now()
);
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  description text,
  category text not null,
  phone text,
  whatsapp text,
  email text,
  website text,
  emergency_available boolean not null default false,
  verification_status public.verification_status not null default 'pending',
  last_verified_at timestamptz,
  next_review_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  correlation_id text,
  created_at timestamptz not null default now()
);
create index cases_status_created_idx on public.cases(status, created_at desc);
create index cases_priority_idx on public.cases(priority);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index resources_category_active_idx on public.resources(category, active, verification_status);
alter table public.profiles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.support_sessions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.cases enable row level security;
alter table public.case_assignments enable row level security;
alter table public.ai_assessments enable row level security;
alter table public.resources enable row level security;
alter table public.audit_logs enable row level security;
create policy "users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "public can read approved resources" on public.resources for select using (active = true and verification_status = 'verified');
-- Sensitive session, case, message and audit access is intentionally server-mediated.
-- Add narrowly scoped authenticated policies alongside the trusted authorization layer before production launch.;
