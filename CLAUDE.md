# Curionaut — ficha para Claude (repo `curionauta`)

Web de **curionaut.org** (dominio comprado en Cloudflare el 10/11/2026; antes en `https://curionauta.agomez-saturno.workers.dev`): página pública ES/FR,
la **Estación** (panel del niño con mentor y cuaderno) y los juegos, todo bajo el mismo dominio para que la Estación
lea el progreso de cada juego desde `localStorage`.

## Estructura
- `site/` → se publica. `site/estacion/` (app.js lógica, mentores.js frases/preguntas ES/FR, estacion.css, sw.js, config.js).
- `site/index.html`, `site/fr/`, `site/legal/`, `site/estilo.css`, `site/404.html` **se generan** con `python3 tools/paginas.py`: no editar a mano.
- `site/comun/volver.js` → pestaña «Volver a la Estación» que `montar.sh` inyecta en cada juego.
- `tools/montar.sh` → copia `site/` a `dist/` y descarga los juegos de sus repos (`LOCAL=/home/claude` usa clones locales).
- `supabase/` → `0031_estacion.sql`, `0032_cuaderno.sql` (**ya ejecutados** en Supabase el 10/11/2026).
- `voces/` + `tools/voces-*.js` → inventario y grabación de voces de los mentores (ElevenLabs, pendiente).
- `docs/PUBLICAR.md` (publicación) y `docs/COMO-TRABAJAMOS.md` (método de trabajo con Alejandro).

## Publicación
Cloudflare **Workers** (no Pages) conectado a este repo: `wrangler.jsonc` ejecuta `bash tools/montar.sh` y publica `dist/`.
Cada push a `main` despliega solo en 2–3 min. Comprobar con WebFetch añadiendo `?v=algo` (la caché dura 15 min).

## Juegos y su clave de guardado (rutas `/juegos/<id>/`)
| Juego | Repo | Clave `localStorage` |
|---|---|---|
| Chrono-Ohm | `chrono-ohm` | `chrono-ohm-v1` |
| Expedición Pitágoras | `expedicion-pitagoras` | `expedicion-pitagoras-v1` |
| PhiloQuest | `PHYLOQUEST` | `philoquest.v3.store` |
| UMBRAL | `UMBRAL-D-D-QUEST` | `umbral.save.v3` |
| Rutinator v3 (`/rutinator/`) | `RutinatorV3` | `rutineitor.v3.estado` |
| El Refugio 0.1 (`/refugio/`) | este repo, `site/refugio/` | `curionauta-refugio-0.1` (ficha: `docs/REFUGIO.md`) |
| Estación | — | `estacion-nil-v1` (se mantiene para la mudanza desde `agomezbl/estacion-nil`) |

Un juego nuevo necesita: entrada en `tools/montar.sh`, lector en `GAMES` de `app.js` y temas en `mentores.js`.

## Pruebas (deben pasar antes de subir)
```
LOCAL=/home/claude bash tools/montar.sh && node tools/test.js     # 79 comprobaciones, navegador real
node tools/test-mudanza.js ../estacion-nil                         # aviso de la Estación antigua → la nueva
node tools/test-refugio.js                                         # El Refugio: los tres retos tocando la escena
AXE=/ruta/axe.min.js node tools/test-accesibilidad.js              # WCAG 2.1 AA
PGHOST=/socket PGPORT=5499 bash tools/prueba-sql.sh                # reglas de Supabase sobre Postgres local
```

## Pendiente (nov 2026)
- `curionaut.org` conectado al Worker el 10/11/2026. **Sin mudanza de datos**: Alejandro decidió empezar de cero en curionaut.org.
  La Estación antigua (`estacion-nil`) solo muestra un aviso con un botón que lleva a la nueva (`nuevaUrl` en su `config.js`).
  El código que recibe `#mudanza=` en `app.js` se queda, pero ya no se usa.
- `curionaut.com` estaba en *pending delete* el 10/11/2026 (se libera hacia el 15/11): si se consigue, que redirija a curionaut.org.
- **Rutinator v3** (`/rutinator/`) es el activo: Nil empieza con él desde cero en curionaut.org (decidido el 10/11/2026), y «Abrir Rutinator» lleva allí.
  La **v2** (https://rutinator-v2.vercel.app/, Supabase `rkunylxrbnndijyvisfj`) sigue en marcha y hay que cuidarla:
  no tocar sus tablas (`tasks`, `task_status`, `ledger_entries`, `calendar_events`, `schedule_blocks`, `settings`) al hacer la base multifamilia.
- La marca visible es **Curionaut** (igual en ES/FR/EN); los niños son «curionautas» / «curionautes». El repo, el Worker y las claves internas siguen llamándose `curionauta`.
- Voces de los mentores con ElevenLabs (4 voces × ES/FR) mediante GitHub Actions.
- Escenas animadas tipo cómic (motor común + imágenes con Gemini vía GitHub Actions en repo privado `curionauta-estudio`).
- Mentor con IA barata (al final, solo para probar en casa). Inglés al final.

## Cómo trabajar con Alejandro
- Escribe en **español**, para alguien que **no programa**: pasos numerados, sin jerga, y di qué botón pulsar.
- Pregunta antes de construir algo grande o caro de rehacer; lo pequeño, hazlo directamente.
- Nivel de producto profesional: probar en navegador real (PC y móvil) antes de dar algo por terminado.
- Idiomas: **francés y español** como mínimo (público: Francia y España); inglés más adelante.
- Diseño para niños: sin ansiedad, sin perseguir al niño, sin publicidad ni rastreadores.
- Los repositorios son **públicos**: nada de datos personales de la familia ni del niño.
- **Nunca** guardes ni pidas claves secretas en el chat o en el repositorio (ElevenLabs, Gemini, `service_role` de Supabase).
  Las claves van como secretos de GitHub Actions. La clave `sb_publishable_…` de Supabase sí es pública.
- Commits: `git -c user.name="agomezbl" -c user.email="agomezbl@users.noreply.github.com" commit …`.
- Cuando se publica un juego en su repo, esta web no lo recoge sola: subir un commit (aunque sea vacío) aquí
  para que Cloudflare vuelva a montarla.
