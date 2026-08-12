-- Hunger League: schema + RLS policies
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: every step below is idempotent.

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id),
  name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists plays (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  action_id text not null,
  points int not null,
  created_at timestamptz not null default now()
);

alter table players enable row level security;
alter table plays enable row level security;

-- Only these emails may join or see the group's data.
-- Edit this list (add/remove emails) and re-run the whole file whenever the group changes.
-- Both policies below reference the same list, so keep them in sync.

drop policy if exists "players are readable by allowed users" on players;
create policy "players are readable by allowed users"
  on players for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') = any (array[
      'juanpimod@gmail.com',
      'benavav@gmail.com',
      'linfantecastaneda@gmail.com'
    ])
  );

drop policy if exists "plays are readable by allowed users" on plays;
create policy "plays are readable by allowed users"
  on plays for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') = any (array[
      'juanpimod@gmail.com',
      'benavav@gmail.com',
      'linfantecastaneda@gmail.com'
    ])
  );

-- On first login, an allowed user creates their own player profile (one per user_id)
drop policy if exists "users can create their own player profile" on players;
create policy "users can create their own player profile"
  on players for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (auth.jwt() ->> 'email') = any (array[
      'juanpimod@gmail.com',
      'benavav@gmail.com',
      'linfantecastaneda@gmail.com'
    ])
  );

-- Registering a play: only for the player row the current user owns
drop policy if exists "users can register plays for their own player" on plays;
create policy "users can register plays for their own player"
  on plays for insert
  to authenticated
  with check (
    exists (
      select 1 from players p
      where p.id = player_id and p.user_id = auth.uid()
    )
  );

-- Admins can remove players (and their plays cascade automatically)
drop policy if exists "admins can delete players" on players;
create policy "admins can delete players"
  on players for delete
  to authenticated
  using (
    exists (
      select 1 from players me
      where me.user_id = auth.uid() and me.is_admin
    )
  );

drop policy if exists "admins can delete plays" on plays;
create policy "admins can delete plays"
  on plays for delete
  to authenticated
  using (
    exists (
      select 1 from players me
      where me.user_id = auth.uid() and me.is_admin
    )
  );

-- Live feed: broadcast new plays to everyone connected (safe to re-run)
do $$
begin
  alter publication supabase_realtime add table plays;
exception
  when duplicate_object then null;
end $$;

-- After you sign up through the app once (so your player row exists),
-- run this to make yourself the first admin:
-- update players set is_admin = true
--   where user_id = (select id from auth.users where email = 'juanpimod@gmail.com');
