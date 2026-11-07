# Curionauta

La web de **curionauta.com**: la página pública para familias (español y francés), la **Estación**
(el panel del niño, con su mentor y su cuaderno de vuelo) y los juegos, todo bajo la misma dirección.

```
curionauta.com/                   web pública (ES)        · /fr/  la misma en francés
curionauta.com/estacion/          la Estación (app instalable, funciona sin conexión)
curionauta.com/juegos/chrono-ohm/ · /juegos/pitagoras/ · /juegos/philoquest/ · /juegos/umbral/
curionauta.com/legal/privacidad.html · /fr/confidentialite.html
```

Que todo cuelgue de la **misma dirección** es lo que permite a la Estación leer el progreso de cada juego
en el propio aparato, sin cuentas ni servidores de por medio.

## Cómo se publica

Cloudflare Pages, conectado a este repositorio:

- Orden de compilación: `bash tools/montar.sh`
- Carpeta de salida: `dist`

`tools/montar.sh` copia `site/` y descarga los juegos desde sus propios repositorios de GitHub
(`chrono-ohm`, `expedicion-pitagoras`, `PHYLOQUEST`, `UMBRAL-D-D-QUEST`), así cada juego tiene una sola
fuente. Tras publicar un juego, basta con volver a desplegar esta web.

## Partes

| Carpeta | Qué hay |
|---|---|
| `site/estacion/` | La Estación: `app.js` (lógica), `mentores.js` (los 4 mentores y todas sus frases y preguntas, ES/FR), `estacion.css`, `sw.js`, `config.js` |
| `site/` | Web pública generada por `tools/paginas.py` (no editar a mano `index.html`, `fr/`, `legal/`, `estilo.css`) |
| `site/fonts/` | Unbounded y Atkinson Hyperlegible, alojadas aquí (licencia OFL) |
| `site/_headers`, `site/_redirects` | Cabeceras de seguridad y redirecciones de Cloudflare |
| `supabase/` | `0031_estacion.sql` (notas, enlaces, progreso) y `0032_cuaderno.sql` (reflexiones y revisión del padre) |
| `tools/` | `montar.sh`, `paginas.py`, `test.js` (navegador real), `test-mudanza.js`, `prueba-sql.sh` (reglas de la base de datos sobre Postgres) |

## El mentor (fase 1, sin IA)

1. Al volver de un juego, la Estación compara el progreso con el de la última visita y apunta en el
   cuaderno lo que ha hecho (misiones, cámaras, llaves) y de qué tema.
2. El mentor elegido (Bitácora, Brújula, Astrolabio o Faro) lo comenta con su estilo, cuenta un dato
   histórico del tema y propone **una sola pregunta**, siempre opcional.
3. La respuesta queda «pendiente». El padre la lee en la zona de padres y la valida con 10, 25 o 50
   puntos de bitácora, o la devuelve con una nota. Solo la función `estacion_revisar` puede hacerlo,
   y exige la clave de padre (o la sesión del padre).

Para cambiar o añadir frases y preguntas: `site/estacion/mentores.js`. Cada tema es `<juego>:<capítulo>`.

## Pruebas

```
bash tools/montar.sh && node tools/test.js && node tools/test-mudanza.js ../estacion-nil
PGHOST=/socket PGPORT=5499 bash tools/prueba-sql.sh
```

© 2026 Curionauta. Todos los derechos reservados.
