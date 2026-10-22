-- Daily — sync schema.
-- Paste the whole file into the Supabase SQL editor and run it once.
-- Supersedes the earlier auth-based version: there are no accounts any more.
--
-- The shape: one row per device key. RLS is on and there are deliberately NO
-- policies, so the table is unreachable over REST. Reads and writes go through
-- the two functions below, which only ever touch the row matching the key they
-- are handed. That is why the publishable key being public does not matter.

drop function if exists public.habits_get(text);
drop function if exists public.habits_put(text, jsonb);
drop table    if exists public.habits_state;

create table public.habits_state (
  key        text primary key check (length(key) between 24 and 64),
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table public.habits_state enable row level security;
revoke all on public.habits_state from anon, authenticated;
-- no policies on purpose: nothing reaches this table directly

create or replace function public.habits_get(p_key text)
  returns jsonb
  language sql
  security definer
  set search_path = public
as $$
  select data from public.habits_state where key = p_key;
$$;

create or replace function public.habits_put(p_key text, p_data jsonb)
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  -- A few KB is normal. This only stops someone filling the free tier.
  if pg_column_size(p_data) > 2 * 1024 * 1024 then
    raise exception 'payload too large';
  end if;

  -- Anyone can read the publishable key out of the page source and call this
  -- with a key of their choosing. Guessing an existing one is hopeless -- 160
  -- bits -- but nothing stops them creating rows under keys of their own, so
  -- cap how many rows can exist at all. A handful of devices needs a handful
  -- of rows; raise the number here if you ever run out.
  if (select count(*) from public.habits_state) >= 20
     and not exists (select 1 from public.habits_state where key = p_key) then
    raise exception 'no room for a new key';
  end if;

  insert into public.habits_state (key, data, updated_at)
  values (p_key, p_data, now())
  on conflict (key) do update
    set data = excluded.data, updated_at = now();
end;
$$;

revoke all on function public.habits_get(text)        from public;
revoke all on function public.habits_put(text, jsonb) from public;
grant execute on function public.habits_get(text)        to anon;
grant execute on function public.habits_put(text, jsonb) to anon;
