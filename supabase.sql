-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Both tables are accessed only through server-side route handlers using the
-- service_role key, so RLS is enabled with no public policies attached —
-- anon/browser clients cannot read or write these tables directly.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  short_id text unique not null,
  customer_name text,
  product_title text not null,
  price numeric,
  currency text default 'ZAR',
  quantity int not null default 1,
  product_url text,
  whatsapp_number text,
  status text not null default 'processing',
  eta text,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the column if this table already existed without it.
alter table orders add column if not exists whatsapp_number text;

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('web', 'whatsapp')),
  external_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists conversations_lookup
  on conversations (channel, external_id, created_at);

alter table orders enable row level security;
alter table conversations enable row level security;
