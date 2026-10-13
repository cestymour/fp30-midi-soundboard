# Non-régression automatique (outil de la refonte)

Compare la build courante (`dist/`) à la dernière version vanilla (tag `v1-vanilla`) dans un Chromium headless. Ne remplace pas la checklist sur tablette (`docs/checklist.md`) : pas de vrai piano (USB/BLE), pas de Wake Lock, pas de tactile réel.

## Ce qui est vérifié

- `compare.mjs` + `diff.cjs` : captures des 4 onglets, des deux popups FX, d'un son en lecture et de la popup « À propos », en paysage (1280×800) et en portrait (800×1280), comparées au pixel près. Quelques pixels d'écart sur les captures avec animation (son en cours, popups) sont normaux : on les retrouve entre deux captures de la v1 elle-même. « À propos » diffère par le numéro de version.
- `behavior.mjs` + `compare-behavior.mjs` : scénario de 23 étapes (instrument, presets MIDI et audio, surbrillance après changement d'onglet, reset d'un curseur, Échap, reset global, lecture, pause, reprise, seek, changement de son, stop, redémarrage depuis la pause, arrêt d'urgence, volumes, « À propos ») ; l'état du DOM après chaque étape doit être identique entre v1 et nouvelle version.
- `migration.mjs` : v1 installée avec son Service Worker et un son en cache → déploiement de la nouvelle build → anciens caches supprimés, son recopié dans `impro-audio` → serveur arrêté : l'app démarre, les sons déjà joués se relancent (seek compris), un son jamais joué est marqué manquant.
- `styles.sh` (`styles.mjs` + `compare-styles.mjs`) : pour un changement purement CSS, compare deux builds de la nouvelle version (pas la v1) : style calculé de chaque élément et de ses `::before` / `::after`, dans une vingtaine d'états (onglets, survols, focus clavier, popups FX, lecture, pause, glisser du seek, son manquant, « À propos »), sur 7 tailles d'écran qui couvrent tous les paliers des media queries. Les animations sont figées et les positions de lecture fixées pendant le relevé : deux relevés de la même build donnent 0 écart. Usage : copier `dist/` avant le changement (`cp -r dist /tmp/ref`), refaire la build, puis `tools/regression/styles.sh /tmp/ref` (mêmes variables `CHROMIUM_PATH` et `LD_LIBRARY_PATH`, ports 8092 et 8093, dossier `/tmp/fp30-styles` ou `STYLES_WORK`). Ne voit pas les pseudo-éléments des curseurs (`::-webkit-slider-thumb`) : les captures de `compare.mjs` les couvrent en partie.
- `server.mjs` : serveur statique qui répond en 206 aux requêtes `Range`, comme GitHub Pages.

## Préparation (une fois)

Les dépendances de ces scripts sont volontairement hors du projet :

```bash
mkdir -p /tmp/pwtest && cd /tmp/pwtest && npm init -y
npm install playwright-core@1.46 pngjs@7 pixelmatch@5
```

Il faut un Chromium compatible : par exemple celui de Playwright déjà présent dans `~/.cache/ms-playwright/chromium-1134/`. Sous WSL, s'il manque des bibliothèques système (`libgbm.so.1`, `libwayland-server.so.0`), on peut extraire les paquets Debian sans droits root :

```bash
mkdir -p /tmp/libs/deb && cd /tmp/libs/deb
curl -O https://ftp.debian.org/debian/pool/main/m/mesa/libgbm1_20.3.5-1_amd64.deb
curl -O 'https://ftp.debian.org/debian/pool/main/w/wayland/libwayland-server0_1.18.0-2~exp1.1_amd64.deb'
for f in *.deb; do dpkg -x "$f" /tmp/libs/root; done
```

## Lancement

```bash
nvm use && npm run build
CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium-1134/chrome-linux/chrome \
LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/x86_64-linux-gnu \
tools/regression/run.sh
```

Variables : `PLAYWRIGHT_CORE` (chemin de `playwright-core/index.mjs`), `REGRESSION_NODE_MODULES` (dossier contenant `pngjs` et `pixelmatch`), `REGRESSION_WORK` (dossier de travail, `/tmp/fp30-regression` par défaut). Les captures et images de différence sont dans `$REGRESSION_WORK/out/`.

Utilise les ports 8090, 8091 et 8095.
