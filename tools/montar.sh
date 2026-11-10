#!/bin/bash
# Monta la web completa de curionaut.org en dist/:
#   site/            → la web pública, la Estación, los textos legales y los tipos de letra
#   juegos de GitHub → dist/juegos/<nombre>/ (se descargan en cada publicación: una sola fuente)
# Cloudflare Pages lo ejecuta en cada publicación (orden de compilación: bash tools/montar.sh,
# carpeta de salida: dist). En local, con LOCAL=/carpeta/con/los/repos usa copias ya descargadas.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=dist
rm -rf "$OUT"; mkdir -p "$OUT"
cp -r site/. "$OUT/"
STAMP=$(date -u +%Y%m%d%H%M)
sed -i "s/__V__/$STAMP/" "$OUT/estacion/sw.js"

# juegos en /juegos/<id>/ y Rutinator en /rutinator/
JUEGOS="juegos/chrono-ohm:chrono-ohm juegos/pitagoras:expedicion-pitagoras juegos/philoquest:PHYLOQUEST juegos/umbral:UMBRAL-D-D-QUEST rutinator:RutinatorV3"
for par in $JUEGOS; do
  id=${par%%:*}; repo=${par##*:}; dest="$OUT/$id"
  if [ -n "${LOCAL:-}" ] && [ -d "$LOCAL/$repo" ]; then src="$LOCAL/$repo"
  elif [ -n "${LOCAL:-}" ] && [ -d "$LOCAL/$(echo "$repo" | tr A-Z a-z)" ]; then src="$LOCAL/$(echo "$repo" | tr A-Z a-z)"
  else src=$(mktemp -d); git clone -q --depth 1 "https://github.com/agomezbl/$repo.git" "$src"; fi
  mkdir -p "$dest"
  (cd "$src" && git ls-files) | grep -Ev '^(src|tools|i18n|lab|tests|shots|tienda|licenses-src|node_modules)/|(^|/)(package(-lock)?\.json|build\.mjs|[^/]*\.py|[^/]*\.md|\.gitignore|\.nojekyll)$' \
    | while IFS= read -r f; do mkdir -p "$dest/$(dirname "$f")"; cp "$src/$f" "$dest/$f"; done
  # la pestaña «Volver a la Estación» en la página principal de cada juego (y de Rutinator)
  if [ -f "$dest/index.html" ]; then
    node -e '
      const fs = require("fs"), p = process.argv[1], tag = "<script src=\"/comun/volver.js\" defer></script>";
      let s = fs.readFileSync(p, "utf8");
      if (!s.includes(tag)) { const i = s.toLowerCase().lastIndexOf("</body>"); s = i >= 0 ? s.slice(0, i) + tag + "\n" + s.slice(i) : s + tag; fs.writeFileSync(p, s); }
    ' "$dest/index.html"
  fi
  echo "  $id: $(find "$dest" -type f | wc -l) archivos"
done

N=$(find "$OUT" -type f | wc -l); GORDO=$(find "$OUT" -type f -size +25M | wc -l)
echo "dist: $N archivos ($(du -sh "$OUT" | cut -f1)), sw estación $STAMP"
[ "$N" -lt 20000 ] || { echo "ERROR: más de 20.000 archivos (límite de Cloudflare Pages)"; exit 1; }
[ "$GORDO" -eq 0 ] || { echo "ERROR: hay archivos de más de 25 MB"; exit 1; }
