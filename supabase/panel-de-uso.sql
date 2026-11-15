-- =====================================================================
-- Curionaut · Panel de uso para el responsable (Alejandro)
-- Se pega UNA VEZ en Supabase → SQL Editor → New query → Run (el mismo proyecto que 0031–0033).
-- Antes hay que haber ejecutado 0033_monedero.sql. Se puede volver a pasar sin problema.
--
-- Crea tres consultas que solo se pueden usar desde el SQL Editor de Supabase. No las ve la web, ni las
-- familias, ni nadie con la clave pública: viven en un esquema aparte («panel») sin permisos para ellos.
-- Solo cuentan y fechan: no leen el texto de las notas ni de las reflexiones.
--
-- Uso, cada vez que quieras mirar (en una consulta nueva, y Run):
--   select * from panel.resumen();           -- una fila: cuentas, familias, niños activos…
--   select * from panel.familias();          -- una fila por familia: quién, cuándo entró, cuánto lo usa
--   select * from panel.dias();              -- un día por fila, los últimos 30: niños activos, logros, reflexiones
--   select * from panel.dias(90);            -- lo mismo, los últimos 90 días
-- =====================================================================

do $$ begin
  if to_regclass('public.estacion_libro') is null then
    raise exception 'Primero ejecuta 0033_monedero.sql (falta la tabla estacion_libro)';
  end if;
end $$;

create schema if not exists panel;
revoke all on schema panel from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then execute 'revoke all on schema panel from anon'; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then execute 'revoke all on schema panel from authenticated'; end if;
end $$;

-- cada señal de actividad de un niño o adulto, con su fecha (sin contenido)
create or replace view panel.actividad as
  select member_id, updated_at as cuando, 'juego'      as que from public.estacion_progress
  union all select member_id, updated_at, 'nota'       from public.estacion_items
  union all select member_id, created_at, 'reflexion'  from public.estacion_reflexiones
  union all select member_id, created_at, 'monedero'   from public.estacion_libro;

-- 1) RESUMEN
create or replace function panel.resumen()
returns table (cuentas bigint, familias bigint, adultos bigint, ninos bigint,
               ninos_activos_hoy bigint, ninos_activos_7_dias bigint, ninos_activos_30_dias bigint,
               logros_7_dias bigint, reflexiones_7_dias bigint, reflexiones_por_leer bigint)
language sql stable set search_path = public, pg_temp as $$
  with n as (select id from family_members where role is distinct from 'padre')
  select
    (select count(*) from auth.users),
    (select count(distinct family_id) from family_members),
    (select count(*) from family_members where role = 'padre'),
    (select count(*) from n),
    (select count(distinct a.member_id) from panel.actividad a join n on n.id = a.member_id where a.cuando >= date_trunc('day', now())),
    (select count(distinct a.member_id) from panel.actividad a join n on n.id = a.member_id where a.cuando >= now() - interval '7 days'),
    (select count(distinct a.member_id) from panel.actividad a join n on n.id = a.member_id where a.cuando >= now() - interval '30 days'),
    (select count(*) from estacion_libro where e > 0 and k !~ '^(hucha|cambio|buy):' and created_at >= now() - interval '7 days'),
    (select count(*) from estacion_reflexiones where created_at >= now() - interval '7 days'),
    (select count(*) from estacion_reflexiones where estado = 'pendiente');
$$;

-- 2) UNA FILA POR FAMILIA (las más activas primero)
create or replace function panel.familias()
returns table (adulto text, correo text, ninos text, alta date, ultimo_acceso timestamptz,
               ultima_actividad timestamptz, dias_activos_14 bigint, logros_7_dias bigint,
               reflexiones_7_dias bigint, por_leer bigint, energia_total bigint, juegos text)
language sql stable set search_path = public, pg_temp as $$
  select
    (select string_agg(m.display_name, ', ') from family_members m where m.family_id = f.family_id and m.role = 'padre'),
    (select string_agg(u.email, ', ') from family_members m join auth.users u on u.id = m.auth_user_id where m.family_id = f.family_id and m.role = 'padre'),
    (select string_agg(m.display_name, ', ' order by m.display_name) from family_members m where m.family_id = f.family_id and m.role is distinct from 'padre'),
    (select min(u.created_at)::date from family_members m join auth.users u on u.id = m.auth_user_id where m.family_id = f.family_id),
    (select max(u.last_sign_in_at) from family_members m join auth.users u on u.id = m.auth_user_id where m.family_id = f.family_id),
    (select max(a.cuando) from panel.actividad a join family_members m on m.id = a.member_id where m.family_id = f.family_id),
    (select count(distinct a.cuando::date) from panel.actividad a join family_members m on m.id = a.member_id
       where m.family_id = f.family_id and m.role is distinct from 'padre' and a.cuando >= now() - interval '14 days'),
    (select count(*) from estacion_libro l join family_members m on m.id = l.member_id
       where m.family_id = f.family_id and l.e > 0 and l.k !~ '^(hucha|cambio|buy):' and l.created_at >= now() - interval '7 days'),
    (select count(*) from estacion_reflexiones r join family_members m on m.id = r.member_id where m.family_id = f.family_id and r.created_at >= now() - interval '7 days'),
    (select count(*) from estacion_reflexiones r join family_members m on m.id = r.member_id where m.family_id = f.family_id and r.estado = 'pendiente'),
    (select coalesce(sum(l.e), 0) from estacion_libro l join family_members m on m.id = l.member_id where m.family_id = f.family_id),
    (select string_agg(distinct p.game, ', ') from estacion_progress p join family_members m on m.id = p.member_id where m.family_id = f.family_id)
  from (select distinct family_id from family_members) f
  order by 6 desc nulls last;
$$;

-- 3) DÍA A DÍA
create or replace function panel.dias(cuantos int default 30)
returns table (dia date, ninos_activos bigint, logros bigint, reflexiones bigint)
language sql stable set search_path = public, pg_temp as $$
  with d as (select generate_series(current_date - (least(greatest(cuantos, 1), 366) - 1), current_date, interval '1 day')::date as dia),
       n as (select id from family_members where role is distinct from 'padre')
  select d.dia,
    (select count(distinct a.member_id) from panel.actividad a join n on n.id = a.member_id where a.cuando::date = d.dia),
    (select count(*) from estacion_libro l where l.created_at::date = d.dia and l.e > 0 and l.k !~ '^(hucha|cambio|buy):'),
    (select count(*) from estacion_reflexiones r where r.created_at::date = d.dia)
  from d order by d.dia desc;
$$;

revoke all on all functions in schema panel from public;
revoke all on all tables in schema panel from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all functions in schema panel from anon, authenticated';
    execute 'revoke all on all tables in schema panel from anon, authenticated';
  end if;
end $$;

-- comprobación: debe salir una fila con tus números
select * from panel.resumen();
