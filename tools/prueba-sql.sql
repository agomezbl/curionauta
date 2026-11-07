-- Banco de pruebas de las migraciones de la Estación sobre un Postgres local.
-- Imita lo mínimo de Supabase (auth.uid, roles anon/authenticated) y de Rutinator
-- (family_members, app_*(), verify_parent_pin). Uso: ver tools/prueba-sql.sh
create extension if not exists pgcrypto;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create table family_members (id uuid primary key, family_id uuid not null, auth_user_id uuid, display_name text, role text);
grant select on family_members to authenticated;
create function app_family_id() returns uuid language sql stable security definer set search_path = public, pg_temp as $$ select family_id from family_members where auth_user_id = auth.uid() limit 1 $$;
create function app_member_id() returns uuid language sql stable security definer set search_path = public, pg_temp as $$ select id from family_members where auth_user_id = auth.uid() limit 1 $$;
create function app_role() returns text language sql stable security definer set search_path = public, pg_temp as $$ select role from family_members where auth_user_id = auth.uid() limit 1 $$;
-- la clave de padre de la familia de prueba es 1234
create function verify_parent_pin(p_pin text) returns boolean language sql security definer set search_path = public, pg_temp as $$ select app_family_id() is not null and (app_role() = 'padre' or p_pin = '1234') $$;
-- dos familias: A (padre + Nil) y B (otro niño)
insert into family_members values
 ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-000000000001','Papá','padre'),
 ('a0000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-000000000002','Nil','hijo'),
 ('b0000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-000000000003','Otro','hijo');
