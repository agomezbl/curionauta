#!/bin/bash
# Prueba las migraciones 0031 y 0032 en un Postgres local de usar y tirar.
# Uso: PGHOST=/ruta/socket PGPORT=5499 bash tools/prueba-sql.sh
set -e
cd "$(dirname "$0")/.."
DB=curio_test_$$
psql -U postgres -qc "create database $DB" >/dev/null
q() { psql -U postgres -d $DB -v ON_ERROR_STOP=1 -qAt "$@"; }
q -f tools/prueba-sql.sql >/dev/null
q -f supabase/0031_estacion.sql >/dev/null
q -f supabase/0032_cuaderno.sql >/dev/null
q -f supabase/0032_cuaderno.sql >/dev/null   # dos veces: no debe romper nada
como() { echo "begin; set local role authenticated; select set_config('request.jwt.claim.sub','$1',true); $2; commit;"; }
NIL=10000000-0000-0000-0000-000000000002; PAPA=10000000-0000-0000-0000-000000000001; OTRO=10000000-0000-0000-0000-000000000003
ok=0; mal=0
espera() { # espera "descripción" "resultado esperado" "resultado real"
  if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "  ✓ $1"; else mal=$((mal+1)); echo "  ✗ $1 → esperaba «$2», salió «$3»"; fi; }
falla() { # falla "descripción" "sql" usuario
  if q -c "$(como $3 "$2")" >/dev/null 2>&1; then mal=$((mal+1)); echo "  ✗ $1 (debía fallar y no falló)"; else ok=$((ok+1)); echo "  ✓ $1"; fi; }
ins="insert into estacion_reflexiones(id,game,topic,mentor,pregunta,respuesta) values"
q -c "$(como $NIL "$ins ('c0000000-0000-0000-0000-000000000001','chrono-ohm','c2','faro','¿Por qué?','Porque la corriente baja si la resistencia sube')")" >/dev/null
espera "Nil escribe una reflexión" "1" "$(q -c "select count(*) from estacion_reflexiones")"
falla "Nil no puede ponerse puntos al crearla" "$ins ('c0000000-0000-0000-0000-000000000002','x','y','faro','p','r'); update estacion_reflexiones set estado='validada', puntos=50" $NIL
falla "Nil no puede crearla ya validada" "insert into estacion_reflexiones(game,topic,mentor,pregunta,respuesta,estado,puntos) values ('x','y','faro','p','r','validada',50)" $NIL
falla "Nil no puede crearla a nombre de otro" "insert into estacion_reflexiones(member_id,game,topic,mentor,pregunta,respuesta) values ('b0000000-0000-0000-0000-000000000003','x','y','faro','p','r')" $NIL
falla "mentor desconocido rechazado" "$ins (gen_random_uuid(),'x','y','gemini','p','r')" $NIL
espera "Nil no puede cambiarla con update" "0" "$(q -c "$(como $NIL "update estacion_reflexiones set puntos=50, estado='validada'")" | tail -1 | grep -c UPDATE\ 1 || true)"
espera "sigue pendiente" "pendiente|0" "$(q -c "select estado||'|'||puntos from estacion_reflexiones")"
espera "Nil no puede borrarla" "pendiente" "$(q -c "$(como $NIL "delete from estacion_reflexiones")" >/dev/null; q -c "select estado from estacion_reflexiones")"
espera "otra familia no la ve" "0" "$(q -c "$(como $OTRO "select count(*) from estacion_reflexiones")" | sed -n 2p)"
espera "el padre la ve" "1" "$(q -c "$(como $PAPA "select count(*) from estacion_reflexiones")" | sed -n 2p)"
R=c0000000-0000-0000-0000-000000000001
espera "clave mala: rechazada" '{"ok" : false, "error" : "clave"}' "$(q -c "$(como $NIL "select estacion_revisar('0000','$R','validada',50,null)")" | sed -n 2p)"
espera "otra familia no puede revisarla" '{"ok" : false, "error" : "no existe"}' "$(q -c "$(como $OTRO "select estacion_revisar('1234','$R','validada',50,null)")" | sed -n 2p)"
espera "puntos inventados: rechazados" '{"ok" : false, "error" : "puntos"}' "$(q -c "$(como $NIL "select estacion_revisar('1234','$R','validada',40,null)")" | sed -n 2p)"
espera "devolver sin nota: rechazado" '{"ok" : false, "error" : "falta la nota"}' "$(q -c "$(como $NIL "select estacion_revisar('1234','$R','devuelta',0,'  ')")" | sed -n 2p)"
espera "con la clave en el aparato de Nil: validada" '{"ok" : true}' "$(q -c "$(como $NIL "select estacion_revisar('1234','$R','validada',25,'Muy bien explicado')")" | sed -n 2p)"
espera "queda validada con 25 y la nota" "validada|25|Muy bien explicado" "$(q -c "select estado||'|'||puntos||'|'||nota from estacion_reflexiones")"
espera "no se revisa dos veces" '{"ok" : false, "error" : "ya revisada"}' "$(q -c "$(como $PAPA "select estacion_revisar('','$R','validada',50,null)")" | sed -n 2p)"
q -c "$(como $NIL "$ins ('c0000000-0000-0000-0000-000000000009','pitagoras','c1','brujula','p','sí')")" >/dev/null
espera "el padre, con su sesión y sin clave, la devuelve" '{"ok" : true}' "$(q -c "$(como $PAPA "select estacion_revisar('','c0000000-0000-0000-0000-000000000009','devuelta',50,'Explícame el porqué')")" | sed -n 2p)"
espera "devuelta queda sin puntos" "devuelta|0" "$(q -c "select estado||'|'||puntos from estacion_reflexiones where id='c0000000-0000-0000-0000-000000000009'")"
espera "anon no ve nada" "ERROR" "$(q -c "begin; set local role anon; select count(*) from estacion_reflexiones; commit;" 2>&1 | grep -o ERROR | head -1)"
espera "anon no puede revisar" "ERROR" "$(q -c "begin; set local role anon; select estacion_revisar('1234','$R','validada',50,null); commit;" 2>&1 | grep -o ERROR | head -1)"
psql -U postgres -qc "drop database $DB" >/dev/null
echo "$ok bien, $mal mal"; [ $mal -eq 0 ]
