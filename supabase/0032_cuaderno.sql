-- =====================================================================
-- Curionauta · cuaderno de vuelo (reflexiones del niño y revisión del padre)
-- Se pega en Supabase → SQL Editor → New query → Run (el mismo proyecto de siempre).
-- Necesita 0031_estacion.sql pasado antes. No borra nada y se puede pasar dos veces.
--
-- Reglas:
--   · Cada hijo escribe y ve SUS reflexiones; el padre ve las de toda la familia.
--   · El hijo solo puede crear reflexiones «pendientes», sin puntos ni nota.
--   · Nadie puede cambiarlas ni borrarlas directamente: la única puerta es la
--     función estacion_revisar, que exige la clave de padre (o la sesión del padre).
--   · Los puntos solo pueden ser 10, 25 o 50, y solo los pone esa función.
-- =====================================================================

create table if not exists estacion_reflexiones (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default app_member_id() references family_members(id) on delete cascade,
  game text not null check (char_length(game) between 1 and 40),
  topic text not null check (char_length(topic) between 1 and 60),
  mentor text not null check (mentor in ('bitacora', 'brujula', 'astrolabio', 'faro')),
  lang text not null default 'es' check (lang in ('es', 'fr', 'en')),
  contexto text check (contexto is null or char_length(contexto) <= 300),
  pregunta text not null check (char_length(pregunta) between 1 and 400),
  respuesta text not null check (char_length(respuesta) between 1 and 1500),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'validada', 'devuelta')),
  puntos int not null default 0 check (puntos in (0, 10, 25, 50)),
  nota text check (nota is null or char_length(nota) <= 300),
  created_at timestamptz not null default now(),
  revisada_at timestamptz,
  constraint estacion_reflexiones_puntos_coherentes check (
    (estado = 'pendiente' and puntos = 0) or
    (estado = 'validada' and puntos in (10, 25, 50)) or
    (estado = 'devuelta' and puntos = 0 and nota is not null))
);
create index if not exists estacion_reflexiones_member_idx on estacion_reflexiones(member_id, created_at desc);

alter table estacion_reflexiones enable row level security;

drop policy if exists estacion_reflexiones_leer on estacion_reflexiones;
create policy estacion_reflexiones_leer on estacion_reflexiones for select
  using (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  );

drop policy if exists estacion_reflexiones_crear on estacion_reflexiones;
create policy estacion_reflexiones_crear on estacion_reflexiones for insert
  with check (
    member_id = app_member_id()
    and estado = 'pendiente' and puntos = 0 and nota is null and revisada_at is null
  );
-- sin políticas de update ni delete: solo la función de abajo puede cambiarlas

revoke all on estacion_reflexiones from anon;
grant select, insert on estacion_reflexiones to authenticated;

-- ---------------------------------------------------------------------
-- La revisión del padre. Devuelve {ok:true} o {ok:false, error:'...'}
-- sin lanzar errores, para que el contador de intentos de la clave
-- (verify_parent_pin, migraciones 0010 y 0019) nunca se deshaga.
-- ---------------------------------------------------------------------
create or replace function estacion_revisar(p_pin text, p_id uuid, p_estado text, p_puntos int, p_nota text)
returns json
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_fila estacion_reflexiones%rowtype;
  v_nota text := nullif(btrim(coalesce(p_nota, '')), '');
begin
  if not verify_parent_pin(p_pin) then
    return json_build_object('ok', false, 'error', 'clave');
  end if;

  select * into v_fila from estacion_reflexiones
  where id = p_id
    and member_id in (select id from family_members where family_id = app_family_id())
  for update;
  if not found then return json_build_object('ok', false, 'error', 'no existe'); end if;
  if v_fila.estado <> 'pendiente' then return json_build_object('ok', false, 'error', 'ya revisada'); end if;

  if p_estado = 'validada' then
    if p_puntos not in (10, 25, 50) then return json_build_object('ok', false, 'error', 'puntos'); end if;
  elsif p_estado = 'devuelta' then
    if v_nota is null then return json_build_object('ok', false, 'error', 'falta la nota'); end if;
    p_puntos := 0;
  else
    return json_build_object('ok', false, 'error', 'estado');
  end if;
  if v_nota is not null and char_length(v_nota) > 300 then v_nota := left(v_nota, 300); end if;

  update estacion_reflexiones
  set estado = p_estado, puntos = p_puntos, nota = v_nota, revisada_at = now()
  where id = p_id;
  return json_build_object('ok', true);
end $$;

revoke all on function estacion_revisar(text, uuid, text, int, text) from public, anon;
grant execute on function estacion_revisar(text, uuid, text, int, text) to authenticated;

-- comprobación: debe salir una fila con dos «true»
select
  exists (select 1 from pg_tables where tablename = 'estacion_reflexiones') as cuaderno,
  exists (select 1 from pg_proc where proname = 'estacion_revisar')         as revision;
