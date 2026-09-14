-- Isolated scratch database only. Never run against OPS production.
do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon;create role authenticated;create role service_role bypassrls;end if;end $$;
create schema extensions;
create extension pgcrypto with schema extensions;
create table public.users(id uuid primary key,company_id uuid,deleted_at timestamptz,is_active boolean default true,is_company_admin boolean default false,email text);
create table public.companies(id uuid primary key,account_holder_id text,trial_start_date timestamptz,deleted_at timestamptz,admin_ids text[] default array[]::text[]);
create table public.growth_company_milestones(company_id uuid primary key,trial_started_at timestamptz,activated_at timestamptz,first_paid_at timestamptz);
grant usage on schema public,extensions to service_role;
grant all on all tables in schema public to service_role;

create schema auth;
create function auth.jwt() returns jsonb language sql as $$ select '{"role":"service_role"}'::jsonb $$;
create table public.admins(email text primary key);
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id text,company_id text,type text,title text,body text,is_read boolean default false,persistent boolean,action_url text,action_label text,project_id text,deep_link_type text,dedupe_key text,incident_version bigint default 0,created_at timestamptz default now(),resolved_at timestamptz);

grant usage on schema auth to service_role;
grant all on all tables in schema public to service_role;
