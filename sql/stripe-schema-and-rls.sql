-- Execute no SQL Editor do Supabase (Etapa 1 do checkout).
-- Estende profiles para billing Stripe, cria idempotência de webhooks e trava RLS.
--
-- Postgres RLS é por linha, não por coluna. A restrição de campos de billing
-- combina: (1) GRANT UPDATE só em colunas cadastrais; (2) trigger que rejeita
-- mutação de is_premium / Stripe se auth.role() não for service_role.
-- A role service_role do JWT do webhook ignora RLS e pode escrever entitlement.

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists plan_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_plan_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_type_check
      check (plan_type is null or plan_type in ('lifetime', 'monthly'));
  end if;
end $$;

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

comment on table public.stripe_events is
  'Ids de eventos Stripe já processados. Impede replay do webhook.';

-- ---------------------------------------------------------------------------
-- stripe_events: sem políticas para anon/authenticated. service_role ignora RLS.
-- ---------------------------------------------------------------------------
alter table public.stripe_events enable row level security;
alter table public.stripe_events force row level security;

revoke all on table public.stripe_events from anon, authenticated, public;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'stripe_events'
  loop
    execute format('drop policy if exists %I on public.stripe_events', r.policyname);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- profiles: SELECT próprio; INSERT próprio; UPDATE só cadastral.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

revoke all on table public.profiles from anon, public;
revoke insert, update, delete on table public.profiles from authenticated;

grant select on table public.profiles to authenticated;
grant insert (
  id,
  nome_completo,
  data_nascimento,
  destino,
  expressao
) on table public.profiles to authenticated;
grant update (
  nome_completo,
  data_nascimento,
  destino,
  expressao
) on table public.profiles to authenticated;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', r.policyname);
  end loop;
end $$;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.protect_profile_billing_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_premium := false;
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.subscription_status := null;
    new.plan_type := null;
    return new;
  end if;

  if new.is_premium is distinct from old.is_premium
    or new.stripe_customer_id is distinct from old.stripe_customer_id
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    or new.subscription_status is distinct from old.subscription_status
    or new.plan_type is distinct from old.plan_type
  then
    raise exception 'billing columns are service_role only'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_billing_columns on public.profiles;

create trigger protect_profile_billing_columns
  before insert or update on public.profiles
  for each row
  execute procedure public.protect_profile_billing_columns();
