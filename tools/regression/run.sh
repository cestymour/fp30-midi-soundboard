#!/usr/bin/env bash
# Non-régression automatique : compare la build courante (dist/) à une version de référence,
# par défaut la dernière version publiée (dernier tag vX.Y.Z), ou REGRESSION_REF (tag ou commit).
# Voir tools/regression/README.md pour la préparation (Chromium, playwright-core).
set -u
cd "$(dirname "$0")/../.."
REPO=$PWD
[ -f dist/index.html ] || { echo "dist/ absent : lancer npm run build d'abord" >&2; exit 1; }
TOOLS=$REPO/tools/regression
WORK=${REGRESSION_WORK:-/tmp/fp30-regression}
REF=${REGRESSION_REF:-$(git describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*')}
REF_DIR=$WORK/ref
OUT=$WORK/out

rm -rf "$WORK" && mkdir -p "$OUT" "$WORK/site" "$WORK/site-ref"
cp -r dist "$WORK/site/fp30-midi-soundboard"

# Version de référence : v1-vanilla est un site statique, servi tel quel ;
# les versions suivantes sont construites (npm ci + build) dans un worktree
echo "== Référence : $REF"
git worktree add -f "$REF_DIR" "$REF" >/dev/null 2>&1 || { echo "référence introuvable : $REF" >&2; exit 1; }
if [ "$REF" = v1-vanilla ]; then
  REF_ROOT=$REF_DIR
  REF_URL=http://localhost:8090/
else
  (cd "$REF_DIR" && npm ci --no-audit --no-fund --loglevel=error && npm run build >/dev/null) \
    || { echo "build de la référence impossible" >&2; exit 1; }
  cp -r "$REF_DIR/dist" "$WORK/site-ref/fp30-midi-soundboard"
  REF_ROOT=$WORK/site-ref
  REF_URL=http://localhost:8090/fp30-midi-soundboard/
fi

node "$TOOLS/server.mjs" "$REF_ROOT" 8090 & PID_REF=$!
node "$TOOLS/server.mjs" "$WORK/site" 8091 & PID_NEW=$!
# Nettoyage même en cas d'erreur ou d'interruption
trap 'kill $PID_REF $PID_NEW 2>/dev/null; git worktree remove --force "$REF_DIR" 2>/dev/null' EXIT
sleep 1
NEW_URL=http://localhost:8091/fp30-midi-soundboard/

echo "== Captures (paysage 1280×800, portrait 800×1280)"
node "$TOOLS/compare.mjs" ref "$REF_URL" "$OUT/shots/ref" > "$OUT/shots-ref.json"
node "$TOOLS/compare.mjs" new "$NEW_URL" "$OUT/shots/new" > "$OUT/shots-new.json"
node "$TOOLS/diff.cjs" "$OUT/shots/ref" "$OUT/shots/new"

for size in "1280 800" "800 1280"; do
  set -- $size
  echo "== Scénario d'interactions $1×$2"
  node "$TOOLS/behavior.mjs" "$REF_URL" "$1" "$2" > "$OUT/behavior-ref-$1.json"
  node "$TOOLS/behavior.mjs" "$NEW_URL" "$1" "$2" > "$OUT/behavior-new-$1.json"
  node "$TOOLS/compare-behavior.mjs" "$OUT/behavior-ref-$1.json" "$OUT/behavior-new-$1.json"
done

echo "Résultats : $OUT"
