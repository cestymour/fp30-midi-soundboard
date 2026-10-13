#!/usr/bin/env bash
# Compare les styles calculés de deux builds (référence et dist/ courant) sur plusieurs tailles d'écran.
# Usage : tools/regression/styles.sh <dossier de la build de référence>
# Pour un changement purement CSS : copier dist/ avant le changement, puis le passer ici en référence.
set -u
cd "$(dirname "$0")/../.."
REF=${1:?dossier de la build de référence}
[ -f dist/index.html ] || { echo "dist/ absent : lancer npm run build d'abord" >&2; exit 1; }
TOOLS=$PWD/tools/regression
WORK=${STYLES_WORK:-/tmp/fp30-styles}
rm -rf "$WORK" && mkdir -p "$WORK/out" "$WORK/ref" "$WORK/new"
cp -r "$REF" "$WORK/ref/fp30-midi-soundboard"
cp -r dist "$WORK/new/fp30-midi-soundboard"

node "$TOOLS/server.mjs" "$WORK/ref" 8092 & PID_REF=$!
node "$TOOLS/server.mjs" "$WORK/new" 8093 & PID_NEW=$!
trap 'kill $PID_REF $PID_NEW 2>/dev/null' EXIT
sleep 1

# Paysage, portrait, et chaque palier des media queries (1200, 1024, 900, 600, 520 px)
for size in "1280 800" "800 1280" "1100 700" "1000 1300" "880 600" "560 900" "500 400"; do
  set -- $size
  echo "== Styles calculés $1×$2"
  node "$TOOLS/styles.mjs" http://localhost:8092/fp30-midi-soundboard/ "$1" "$2" > "$WORK/out/ref-$1.json"
  node "$TOOLS/styles.mjs" http://localhost:8093/fp30-midi-soundboard/ "$1" "$2" > "$WORK/out/new-$1.json"
  node "$TOOLS/compare-styles.mjs" "$WORK/out/ref-$1.json" "$WORK/out/new-$1.json"
done
