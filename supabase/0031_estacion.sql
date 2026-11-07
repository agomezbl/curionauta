-- =====================================================================
-- Estación Nil · notas, enlaces y progreso de los juegos
-- Se pega en Supabase → SQL Editor → New query → Run (proyecto de Rutinator v2).
-- No borra nada y se puede pasar dos veces sin problema.
-- Cada miembro ve y edita lo suyo; el padre ve lo de toda la familia
-- (la misma regla que el resto de Rutinator desde la migración 0028).
-- =====================================================================

create table if not exists estacion_items (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default app_member_id() references family_members(id) on delete cascade,
  kind text not null check (kind in ('link', 'note')),
  title text not null check (char_length(title) between 1 and 140),
  url text check (url is null or (url ~* '^https://' and char_length(url) <= 600)),
  due date,
  done boolean not null default false,
  color text check (color is null or char_length(color) <= 20),
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists estacion_items_member_idx on estacion_items(member_id, kind);

-- un resumen por juego y por aparato (el móvil y la tableta guardan cada uno su partida)
create table if not exists estacion_progress (
  member_id uuid not null default app_member_id() references family_members(id) on delete cascade,
  game text not null check (char_length(game) between 1 and 40),
  device text not null check (char_length(device) between 1 and 40),
  data jsonb not null check (octet_length(data::text) <= 4000),
  updated_at timestamptz not null default now(),
  primary key (member_id, game, device)
);

alter table estacion_items enable row level security;
alter table estacion_progress enable row level security;

drop policy if exists estacion_items_rw on estacion_items;
create policy estacion_items_rw on estacion_items for all
  using (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  )
  with check (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  );

drop policy if exists estacion_progress_rw on estacion_progress;
create policy estacion_progress_rw on estacion_progress for all
  using (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  )
  with check (
    member_id in (select id from family_members where family_id = app_family_id())
    and (app_role() = 'padre' or member_id = app_member_id())
  );

revoke all on estacion_items, estacion_progress from anon;
grant select, insert, update, delete on estacion_items, estacion_progress to authenticated;

-- comprobación: debe salir una fila con dos «true»
select
  exists (select 1 from pg_tables where tablename = 'estacion_items')   as notas_y_enlaces,
  exists (select 1 from pg_tables where tablename = 'estacion_progress') as progreso_juegos;
