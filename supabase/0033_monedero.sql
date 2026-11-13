-- =====================================================================
-- Curionaut · Estación · 0033 · monedero en la nube
-- Se pega en Supabase → SQL Editor → New query → Run (el mismo proyecto que 0031 y 0032).
-- No borra nada y se puede pasar dos veces sin problema.
--
-- Un libro de puntos por niño, el mismo en el móvil y en la tableta. Cada apunte tiene una clave
-- única: si dos aparatos apuntan el mismo logro, cuenta una sola vez. Desde la app no se puede
-- cambiar ni borrar un apunte. La base comprueba sola, con SU hora (no la del aparato):
--   · que la hucha no se recoja antes de tiempo ni con más premio del que toca;
--   · que el mercado y las compras no creen dinero;
--   · que nadie apunte en el libro de otro.
-- =====================================================================

create table if not exists estacion_libro (
  member_id  uuid not null default app_member_id() references family_members(id) on delete cascade,
  k          text not null check (k ~ '^[a-z0-9_.:-]{1,100}$'),
  e          int  not null default 0 check (e between -1000 and 700),   -- Energía
  c          int  not null default 0 check (c between -10 and 10),      -- Cristales
  g          text not null default '' check (char_length(g) <= 40),     -- juego del que sale
  w          boolean not null default false,                            -- pagado el primer día («bienvenida»)
  x          jsonb check (x is null or octet_length(x::text) <= 300),   -- datos de la hucha
  at         timestamptz not null,                                      -- cuándo se apuntó en el aparato
  created_at timestamptz not null default now(),                        -- cuándo llegó a la nube (hora del servidor)
  primary key (member_id, k)
);
create index if not exists estacion_libro_llegada_idx on estacion_libro(member_id, created_at);

-- Todo pasa por estas reglas, también lo que los aparatos traen de antes. Las huchas viejas no se suben
-- tal cual: la app las convierte antes (ver «pasarHuchasViejas» en app.js).
create or replace function estacion_libro_reglas() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare
  dep estacion_libro; d int; pct int;
begin
  -- el mismo apunte que ya está (otro aparato llegó antes): se ignora sin error
  if exists (select 1 from estacion_libro where member_id = new.member_id and k = new.k) then return null; end if;
  new.created_at := now();
  if new.k like 'hucha:%:in' then
    d := case when (new.x->>'d') ~ '^\d{1,2}$' then (new.x->>'d')::int end;
    if d is null or d not in (3, 7, 14) then raise exception 'hucha: plazo'; end if;
    if new.e > -20 or new.e < -500 or new.c <> 0 then raise exception 'hucha: cantidad'; end if;
    if new.at < now() - interval '1 hour' or new.at > now() + interval '1 hour' then raise exception 'hucha: hora'; end if;
  elsif new.k like 'hucha:%:out' then
    select * into dep from estacion_libro where member_id = new.member_id and k = left(new.k, length(new.k) - 4) || ':in';
    if not found then raise exception 'hucha: no existe'; end if;
    d := (dep.x->>'d')::int;
    pct := case d when 3 then 5 when 7 then 12 when 14 then 30 else 0 end;
    if new.c <> 0 or new.e < -dep.e or new.e > -dep.e + round(-dep.e * pct / 100.0) then raise exception 'hucha: importe'; end if;
    if new.e > -dep.e and now() + interval '5 minutes' < dep.at + make_interval(days => d) then raise exception 'hucha: aún no'; end if;
  elsif new.k like 'cambio:%' then
    if not ((new.c = 1 and new.e <= -90) or (new.c = -1 and new.e between 0 and 88)) then raise exception 'mercado'; end if;
  elsif new.k like 'buy:%' then
    if new.e > 0 or new.c > 0 then raise exception 'compra'; end if;
  else
    if new.e < 0 or new.c < 0 then raise exception 'logro'; end if;
  end if;
  return new;
end $$;

drop trigger if exists estacion_libro_reglas on estacion_libro;
create trigger estacion_libro_reglas before insert on estacion_libro
  for each row execute function estacion_libro_reglas();

alter table estacion_libro enable row level security;

-- ver: el niño su libro; el padre el de toda su familia
drop policy if exists estacion_libro_ver on estacion_libro;
create policy estacion_libro_ver on estacion_libro for select
  using (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  );

-- apuntar: solo en el propio libro. No hay permiso para cambiar ni borrar.
drop policy if exists estacion_libro_apuntar on estacion_libro;
create policy estacion_libro_apuntar on estacion_libro for insert
  with check (member_id = app_member_id());

revoke all on estacion_libro from anon, authenticated;
grant select, insert on estacion_libro to authenticated;

-- comprobación: debe salir una fila con dos «true»
select
  exists (select 1 from pg_tables where tablename = 'estacion_libro')                    as monedero,
  exists (select 1 from pg_trigger where tgname = 'estacion_libro_reglas')               as reglas;
