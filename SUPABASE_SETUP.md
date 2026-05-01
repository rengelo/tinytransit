# Tiny Transit Leaderboard Setup

This game now supports an online leaderboard through Supabase.

## 1. Create a table

Run this SQL in the Supabase SQL editor:

```sql
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

create policy "leaderboard read"
on public.leaderboard_entries
for select
to anon
using (true);

create policy "leaderboard insert"
on public.leaderboard_entries
for insert
to anon
with check (
  char_length(player_name) between 1 and 24
  and score >= 0
  and passengers >= 0
  and revenue >= 0
  and days_operated >= 0
);
```

## 2. Add your project keys

Edit [supabase-config.js](C:\Users\renat\Documents\TinyTraffic\supabase-config.js):

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

Use the project URL and publishable/anon key from your Supabase dashboard.

## 3. Reload the game

If the setup is correct:

- the start modal leaderboard status will switch from `Offline` to `Live`
- players can enter a name before starting
- scores post automatically on gridlock
- the results modal and start modal both show the live top scores
