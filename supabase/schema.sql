-- Run this in the Supabase SQL editor for the katalyze project.
-- Source: docs/PRD.md section 8.

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now(),
  source text,
  plan text -- optional answer to "which plan would you pick?"
);

-- For tables created before the plan question existed:
alter table waitlist add column if not exists plan text;

alter table waitlist enable row level security;

-- No client-side access: all reads/writes go through the /api/waitlist
-- route using the service role key, which bypasses RLS. No policies
-- are needed for anon/authenticated roles.
