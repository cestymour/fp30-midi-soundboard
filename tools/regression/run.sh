#!/usr/bin/env bash
# Non-régression automatique : compare la build courante (dist/) à la v1 (tag v1-vanilla)
# Voir tools/regression/README.md pour la préparation (Chromium, playwright-core).
set -u
cd "$(dirname "$0")/../.."
REPO=$PWD
[ -f dist/index.html ] || { echo "dist/ absent : lancer npm run build d'abord" >&2; exit 1; }
TOOLS=$REPO/tools/regression
WORK=${REGRESSION_WORK:-/tmp/fp30-regression}
V1_DIR=$WORK/v1
OUT=$WORK/out

rm -rf "$WORK" && mkdir -p "$OUT" "$WORK/site" "$WORK/site2"
git worktree add -f "$V1_DIR" v1-vanilla >/dev/null 2>&1
cp -r dist "$WORK/site/fp30-midi-soundboard"

node "$TOOLS/server.mjs" "$V1_DIR" 8090 & PID_V1=$!
node "$TOOLS/server.mjs" "$WORK/site" 8091 & PID_NEW=$!
# Nettoyage même en cas d'erreur ou d'interruption
trap 'kill $PID_V1 $PID_NEW $(cat "$WORK/server.pid" 2>/dev/null) 2>/dev/null; git worktree remove --force "$V1_DIR" 2>/dev/null' EXIT
sleep 1
V1_URL=http://localhost:8090/
NEW_URL=http://localhost:8091/fp30-midi-soundboard/

echo "== Captures (paysage 1280×800, portrait 800×1280)"
node "$TOOLS/compare.mjs" v1  "$V1_URL"  "$OUT/shots/v1"  > "$OUT/shots-v1.json"
node "$TOOLS/compare.mjs" new "$NEW_URL" "$OUT/shots/new" > "$OUT/shots-new.json"
node "$TOOLS/diff.cjs" "$OUT/shots/v1" "$OUT/shots/new"

for size in "1280 800" "800 1280"; do
  set -- $size
  echo "== Scénario d'interactions $1×$2"
  node "$TOOLS/behavior.mjs" "$V1_URL"  "$1" "$2" > "$OUT/behavior-v1-$1.json"
  node "$TOOLS/behavior.mjs" "$NEW_URL" "$1" "$2" > "$OUT/behavior-new-$1.json"
  node "$TOOLS/compare-behavior.mjs" "$OUT/behavior-v1-$1.json" "$OUT/behavior-new-$1.json"
done

echo "== Service Worker : mise à jour depuis la v1, hors ligne"
node "$TOOLS/server.mjs" "$WORK/site2" 8095 & echo $! > "$WORK/server.pid"
sleep 1
SITE2="$WORK/site2/fp30-midi-soundboard" SERVER_PID_FILE="$WORK/server.pid" V1_DIR="$V1_DIR" NEW_BUILD="$REPO/dist" \
  node "$TOOLS/migration.mjs" 2>&1 | grep -v WakeLock

echo "Résultats : $OUT"
