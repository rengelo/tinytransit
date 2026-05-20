# Tiny Transit Leaderboard Setup

This game uses Supabase for a public leaderboard. Scores are submitted through
a Supabase Edge Function so anonymous visitors cannot insert rows directly into
the database table.

## 1. Lock down the table

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
```

The important part is `drop policy if exists "leaderboard insert"`. The browser
can still read the top scores, but it cannot insert rows directly anymore.

## 2. Deploy the Edge Function

Install and log in to the Supabase CLI if needed, then run this from the project
folder:

```bash
supabase login
supabase link --project-ref raxvamuljvftpokziwmg
supabase functions deploy submit-score
```

The function in `supabase/functions/submit-score/index.ts` validates every score,
rate-limits repeated submissions from the same IP/browser, and inserts with the
private service role key inside Supabase. It does not enforce maximum score caps.
The `supabase/config.toml` file disables Supabase's built-in JWT check for this
function because the site uses a public publishable key and the function does its
own validation and rate limiting.

## 3. Keep the browser config public-only

`supabase-config.js` should only contain the project URL and anon/publishable key:

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

Never put the service role key in this file or anywhere in browser code.

## 4. Reload the game

If the setup is correct:

- the start modal leaderboard status will switch from `Offline` to `Live`
- players can enter a name before starting
- scores post through `/functions/v1/submit-score` on gridlock
- direct inserts into `leaderboard_entries` from the public anon key will fail
