-- NormWise Sprint 1 authoritative schema.
-- This migration is additive and does not drop legacy tables in an existing database.
create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text,
  email text unique,
  role text not null default 'PROCUREMENT_OFFICER' check (role in ('PROCUREMENT_OFFICER','TECHNICAL_REVIEWER','ADMIN','AUDITOR')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.standards (
  id uuid primary key default gen_random_uuid(),
  is_number text not null unique,
  title text not null,
  year int,
  edition text,
  revision text,
  scope text,
  product text,
  material text,
  application text,
  technical_attributes jsonb not null default '{}'::jsonb,
  status text not null default 'UNKNOWN' check (status in ('CURRENT','SUPERSEDED','WITHDRAWN','UNDER_REVIEW','UNKNOWN')),
  certification text,
  search_text text not null default '',
  embedding vector(1536),
  source_name text not null,
  source_reference text not null,
  source_url text,
  validation_date date,
  publication_information text,
  technical_department text,
  sectional_committee text,
  superseded_by uuid references public.standards(id) on delete set null,
  content_hash text,
  category text not null check (category in ('Domestic kitchenware','Electrical accessories','Industrial/general hardware and plumbing components','Vehicle components/accessories')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  file_name text not null,
  file_type text,
  storage_path text,
  file_hash text,
  extracted_text text,
  processing_status text not null default 'UPLOADED' check (processing_status in ('UPLOADED','PROCESSING','COMPLETED','FAILED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  query_text text not null,
  document_id uuid references public.documents(id) on delete set null,
  primary_standard_id uuid references public.standards(id) on delete set null,
  confidence numeric(5,4),
  review_state text not null default 'PENDING_REVIEW',
  status text not null default 'PENDING',
  certification_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendation_standards (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  standard_id uuid not null references public.standards(id) on delete cascade,
  rank int not null check (rank > 0),
  score numeric(8,6),
  is_primary boolean not null default false,
  ranking_method text not null default 'metadata_lexical',
  created_at timestamptz not null default now(),
  unique (recommendation_id, standard_id)
);

create table if not exists public.related_standards (
  id uuid primary key default gen_random_uuid(),
  source_standard_id uuid not null references public.standards(id) on delete cascade,
  related_standard_id uuid not null references public.standards(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('normative_reference','test_method','terminology','safety','installation','component','material','equivalent')),
  relationship_reason text not null,
  confidence numeric(5,4),
  source_reference text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_standard_id, related_standard_id, relationship_type),
  check (source_standard_id <> related_standard_id)
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references public.recommendations(id) on delete cascade,
  standard_id uuid references public.standards(id) on delete cascade,
  source_type text not null,
  source_reference text not null,
  source_url text,
  page_number int,
  clause_reference text,
  evidence_text text not null,
  evidence_type text not null,
  created_at timestamptz not null default now(),
  check (recommendation_id is not null or standard_id is not null)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  recommendation_id uuid references public.recommendations(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists standards_category_idx on public.standards(category);
create index if not exists standards_status_idx on public.standards(status);
create index if not exists standards_product_idx on public.standards(product);
create index if not exists standards_material_idx on public.standards(material);
create index if not exists standards_application_idx on public.standards(application);
create index if not exists standards_search_text_idx on public.standards using gin (to_tsvector('english', search_text));
create index if not exists related_standards_source_idx on public.related_standards(source_standard_id);
create index if not exists related_standards_related_idx on public.related_standards(related_standard_id);
create index if not exists evidence_standard_idx on public.evidence(standard_id);
create index if not exists evidence_recommendation_idx on public.evidence(recommendation_id);

alter table public.users enable row level security;
alter table public.standards enable row level security;
alter table public.documents enable row level security;
alter table public.recommendations enable row level security;
alter table public.recommendation_standards enable row level security;
alter table public.related_standards enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists standards_read_authenticated on public.standards;
create policy standards_read_authenticated on public.standards for select to authenticated using (true);
drop policy if exists related_standards_read_authenticated on public.related_standards;
create policy related_standards_read_authenticated on public.related_standards for select to authenticated using (true);
drop policy if exists evidence_read_authenticated on public.evidence;
create policy evidence_read_authenticated on public.evidence for select to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('procurement-documents', 'procurement-documents', false)
on conflict (id) do nothing;
