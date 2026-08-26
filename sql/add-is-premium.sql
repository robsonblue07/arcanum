-- Execute no SQL Editor do Supabase.
-- Adiciona o flag Freemium na tabela de perfis (default: não premium).

alter table public.profiles
  add column if not exists is_premium boolean not null default false;
