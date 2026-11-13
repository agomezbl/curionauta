#!/bin/bash
# Prueba las migraciones 0031, 0032 y 0033 en un Postgres local de usar y tirar.
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
q -f supabase/0033_monedero.sql >/dev/null
q -f supabase/0033_monedero.sql >/dev/null   # dos veces: no debe romper nada
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
# ---------- 0033 · monedero en la nube ----------
lib="insert into estacion_libro(k,e,c,g,x,at) values"
cuenta() { q -c "select count(*) from estacion_libro where k like '$1'"; }
q -c "$(como $NIL "$lib ('ohm:m:c1:1-1',20,0,'chrono-ohm',null,now())")" >/dev/null
espera "Nil apunta un logro en su libro" "1" "$(cuenta 'ohm:m:c1:1-1')"
q -c "$(como $NIL "$lib ('ohm:m:c1:1-1',40,0,'chrono-ohm',null,now())")" >/dev/null 2>&1
espera "el mismo logro desde otro aparato no cuenta dos veces (y no da error)" "1|20" "$(q -c "select count(*)||'|'||max(e) from estacion_libro where k='ohm:m:c1:1-1'")"
q -c "$(como $NIL "insert into estacion_libro(k,e,at,created_at) values ('pit:cam:c1',30,now(),'2020-01-01')")" >/dev/null
espera "la hora de llegada la pone el servidor" "t" "$(q -c "select created_at > now() - interval '1 minute' from estacion_libro where k='pit:cam:c1'")"
falla "Nil no puede apuntar en el libro de otro" "insert into estacion_libro(member_id,k,e,at) values ('b0000000-0000-0000-0000-000000000003','ohm:m:c1:1-2',20,now())" $NIL
falla "Nil no puede cambiar un apunte" "update estacion_libro set e=700" $NIL
falla "Nil no puede borrar un apunte" "delete from estacion_libro" $NIL
falla "un logro no puede restar" "$lib ('ohm:m:c1:1-3',-50,0,'',null,now())" $NIL
falla "clave rara rechazada" "$lib ('Hola mundo',10,0,'',null,now())" $NIL
falla "importe desorbitado rechazado" "$lib ('ohm:m:c1:1-4',5000,0,'',null,now())" $NIL
falla "mercado: un Cristal por 50 rechazado" "$lib ('cambio:a1',-50,1,'',null,now())" $NIL
falla "mercado: vender un Cristal por 200 rechazado" "$lib ('cambio:a2',200,-1,'',null,now())" $NIL
q -c "$(como $NIL "$lib ('cambio:a3',-95,1,'',null,now())")" >/dev/null
espera "mercado: un Cristal por 95, aceptado" "1" "$(cuenta 'cambio:a3')"
falla "una compra no puede dar dinero" "$lib ('buy:casco:gorra',40,0,'',null,now())" $NIL
q -c "$(como $NIL "$lib ('buy:casco:gorra',-40,0,'',null,now())")" >/dev/null
espera "una compra normal, aceptada" "1" "$(cuenta 'buy:casco:gorra')"
q -c "$(como $NIL "$lib ('hucha:h1:in',-100,0,'','{\"d\":14}',now())")" >/dev/null
espera "hucha: guardar 100 a 14 días, aceptado" "1" "$(cuenta 'hucha:h1:in')"
falla "hucha: recogerla con premio el mismo día, rechazado (hora del servidor)" "$lib ('hucha:h1:out',130,0,'','{\"d\":14,\"premio\":30}',now())" $NIL
q -c "$(como $NIL "$lib ('hucha:h1:out',100,0,'','{\"d\":14,\"premio\":0}',now())")" >/dev/null
espera "hucha: romperla devuelve lo guardado, aceptado" "1" "$(cuenta 'hucha:h1:out')"
falla "hucha: fecha del aparato adelantada 2 días, rechazada" "$lib ('hucha:h2:in',-100,0,'','{\"d\":3}',now() + interval '2 days')" $NIL
falla "hucha: plazo inventado, rechazado" "$lib ('hucha:h3:in',-100,0,'','{\"d\":1}',now())" $NIL
falla "hucha: más de 500, rechazado" "$lib ('hucha:h4:in',-900,0,'','{\"d\":3}',now())" $NIL
falla "hucha: recoger una que no existe, rechazado" "$lib ('hucha:nada:out',100,0,'',null,now())" $NIL
q -c "set session_replication_role = replica; insert into estacion_libro(member_id,k,e,x,at,created_at) values ('a0000000-0000-0000-0000-000000000002','hucha:h5:in',-200,'{\"d\":7}',now() - interval '8 days',now() - interval '8 days')" >/dev/null
falla "hucha cumplida: premio de más, rechazado" "$lib ('hucha:h5:out',300,0,'','{\"d\":7}',now())" $NIL
q -c "$(como $NIL "$lib ('hucha:h5:out',224,0,'','{\"d\":7,\"premio\":24}',now())")" >/dev/null
espera "hucha cumplida: lo guardado y el 12 %, aceptado" "224" "$(q -c "select e from estacion_libro where k='hucha:h5:out'")"
q -c "$(como $NIL "$lib ('hucha:viejo:in',-100,0,'','{\"d\":3}','2026-11-05 10:00+01'), ('hucha:viejo:out',105,0,'','{\"d\":3,\"premio\":5}','2026-11-08 11:00+01')")" >/dev/null 2>&1 || true
espera "una hucha con fecha de hace días se rechaza (la app la convierte antes de subirla)" "0" "$(cuenta 'hucha:viejo:%')"
q -c "$(como $NIL "$lib ('hucha:viejo:legado',5,0,'','{\"d\":3,\"premio\":5}',now())")" >/dev/null
espera "el premio de una hucha vieja ya cobrada sube como un apunte normal" "1" "$(cuenta 'hucha:viejo:legado')"
espera "el padre ve el libro de Nil" "9" "$(q -c "$(como $PAPA "select count(*) from estacion_libro")" | sed -n 2p)"
espera "otra familia no lo ve" "0" "$(q -c "$(como $OTRO "select count(*) from estacion_libro")" | sed -n 2p)"
espera "anon no ve el monedero" "ERROR" "$(q -c "begin; set local role anon; select count(*) from estacion_libro; commit;" 2>&1 | grep -o ERROR | head -1)"
espera "saldo de Nil en la nube" "-56|1" "$(q -c "select sum(e)||'|'||sum(c) from estacion_libro")"
psql -U postgres -qc "drop database $DB" >/dev/null
echo "$ok bien, $mal mal"; [ $mal -eq 0 ]
