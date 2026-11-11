# Non-régression automatique

Compare la build courante (`dist/`) à une version de référence dans un Chrome headless : par défaut la dernière version publiée (dernier tag `vX.Y.Z`), ou celle donnée par `REGRESSION_REF` (tag ou commit). La référence est construite dans un worktree temporaire (`npm ci` puis `npm run build`) ; `REGRESSION_REF=v1-vanilla` compare à la version d'avant la réécriture en Svelte, un site statique servi tel quel. Ne remplace pas la checklist sur tablette (`docs/checklist.md`) : pas de vrai piano (USB/BLE), pas de Wake Lock, pas de tactile réel, pas de hors ligne.

Les scripts sont en Node et marchent sous Windows comme sous Linux. Leurs dépendances (`playwright-core`, `pngjs`, `pixelmatch`) sont des devDependencies du projet : `npm install` suffit. Ils utilisent le **Chrome installé** sur la machine (rien à télécharger).

## Lancement

```bash
npm run build
npm run regression
```

Compter environ 5 minutes (dont l'installation et la build de la référence). Le code de sortie vaut 1 si le scénario d'interactions trouve un écart. Les captures, les images de différence (`diff-*.png`) et les relevés sont dans le dossier temporaire du système, `fp30-regression/out/` (sous Windows : `%TEMP%\fp30-regression\out`).

Pour un changement purement CSS, comparer les styles calculés :

```bash
# avant le changement
npm run build && cp -r dist ../dist-ref
# après le changement
npm run build && npm run regression:styles -- ../dist-ref
```

Compter environ 25 minutes (37 états sur 7 tailles d'écran).

## Ce qui est vérifié

- `compare.mjs` + `diff.mjs` : captures des onglets, des deux popups FX, d'un son en lecture et de la popup « Paramètres », en paysage (1280×800) et en portrait (800×1280), comparées au pixel près. Les transitions CSS sont terminées avant chaque capture. Quelques pixels d'écart sur « son en lecture » et « Paramètres » (prise par-dessus ce son) sont normaux : la progression dépend du moment de la capture. « Paramètres » diffère aussi par le numéro de version.
- `behavior.mjs` + `compare-behavior.mjs` : scénario de 23 étapes (instrument, presets MIDI et audio, surbrillance après changement d'onglet, reset d'un curseur, Échap, reset global, lecture, pause, reprise, seek, changement de son, stop, redémarrage depuis la pause, arrêt d'urgence, volumes, popup « Paramètres ») ; l'état du DOM après chaque étape doit être identique entre la référence et la nouvelle version.
- `run-styles.mjs` (`styles.mjs` + `compare-styles.mjs`) : compare deux builds Vite (pas `v1-vanilla`) : style calculé de chaque élément et de ses `::before` / `::after`, dans une vingtaine d'états (onglets, survols, focus clavier, popups FX, lecture, pause, glisser du seek, son manquant, popup « Paramètres »), sur 7 tailles d'écran qui couvrent tous les paliers des media queries. Les animations sont figées et les positions de lecture fixées pendant le relevé : deux relevés de la même build donnent 0 écart. Ne voit pas les pseudo-éléments des curseurs (`::-webkit-slider-thumb`) : les captures de `compare.mjs` les couvrent en partie.
- `server.mjs` : serveur statique qui répond en 206 aux requêtes `Range`, comme GitHub Pages.
- `run.mjs`, `run-styles.mjs`, `common.mjs` : enchaînement (worktree, builds, serveurs, nettoyage).

## Variables

- `REGRESSION_REF` : version de référence (tag ou commit).
- `CHROMIUM_PATH` : un autre navigateur que le Chrome installé, par exemple le Chromium 106 de la tablette de scène (voir `CLAUDE.md`). Vérifié avec le Chromium 106.0.5249.0 (lien de téléchargement dans `CLAUDE.md`) : Playwright le pilote sans problème. À faire après toute mise à jour de Vite ou tout changement de CSS.
- `REGRESSION_CHANNEL` : un autre navigateur installé, par exemple `msedge` (défaut : `chrome`).
- `REGRESSION_WORK`, `STYLES_WORK` : dossiers de travail.

Ports utilisés : 8090 et 8091 (`run.mjs`), 8092 et 8093 (`run-styles.mjs`).
