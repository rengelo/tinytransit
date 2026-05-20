create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 24),
  score integer not null check (score >= 0),
  passengers integer not null check (passengers >= 0),
  revenue integer not null check (revenue >= 0),
  days_operated integer not null check (days_operated >= 0),
  created_at timestamptz not null default now()
);

alter table public.leaderboard_entries enable row level security;

drop policy if exists "leaderboard read" on public.leaderboard_entries;
create policy "leaderboard read"
on public.leaderboard_entries
for select
to anon
using (true);

drop policy if exists "leaderboard insert" on public.leaderboard_entries;

create table if not exists public.leaderboard_submission_limits (
  submitter_key text primary key,
  last_submitted_at timestamptz not null default now()
);

alter table public.leaderboard_submission_limits enable row level security;
