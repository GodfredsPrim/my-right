create table public.support_attachments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_sessions(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);
create index support_attachments_session_idx on public.support_attachments(session_id, created_at desc);
alter table public.support_attachments enable row level security;
revoke all on public.support_attachments from anon, authenticated;
grant all on public.support_attachments to service_role;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set public = false, file_size_limit = 10485760;
