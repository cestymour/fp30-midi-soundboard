# Refonte technique — brief pour l'IA

Ce fichier est un **prompt de travail**. Il décrit la refonte technique du projet de bout en bout. Si tu es une IA chargée de la réaliser : lis-le en entier, lis `CLAUDE.md`, regarde la section « Suivi » en bas pour savoir où on en est, puis reprends à la première étape non cochée.

---

## 1. Contexte

- **Application** : PWA soundboard pour du théâtre d'improvisation, utilisée **en spectacle** sur une tablette Android ~11" dans Chrome (paysage et portrait). Elle pilote un piano Roland FP-30X en MIDI (USB via Web MIDI, ou BLE via Web Bluetooth) et joue des clips audio à travers une chaîne d'effets Web Audio.
- **Utilisateur** : un seul développeur, projet perso. Code, commentaires, textes d'interface et messages de commit **en français**.
- **Dépôt** : `git@github-perso:cestymour/fp30-midi-soundboard.git`. Production : https://cestymour.github.io/fp30-midi-soundboard/ (GitHub Pages, déployé à **chaque push sur `main`** par `.github/workflows/deploy.yml`).
- **Stack actuelle** : vanilla JS sans build, sans modules (scope global, ordre des `<script>` dans `index.html` = ordre des dépendances), sans tests. Environ 4 600 lignes de JS et 2 100 de CSS. Voir `CLAUDE.md` pour l'architecture détaillée.

### Problèmes à résoudre

1. Scope global et dépendances implicites. `STATE` est déclaré dans `app.js` (chargé en dernier) mais utilisé par les fichiers précédents.
2. `js/midi-fx-ui.js` et `js/audio-fx-ui.js` (~630 lignes chacun) sont deux implémentations parallèles quasi identiques.
3. Maintenance manuelle fragile : `APP_VERSION` à incrémenter à la main dans `version.js`, et liste `APP_ASSETS` de `sw.js` à garder synchronisée avec `index.html`.
4. Le cache audio est versionné (`impro-audio-${APP_VERSION}`) : chaque nouvelle version fait retélécharger ~104 Mo de sons.
5. DOM construit impérativement, synchronisation état ↔ interface à la main.
6. Aucun typage alors que la config (`MIDI_TABS`, `AUDIO_TABS`, presets FX) a un schéma riche, et aucun test.

### Stack cible

- **Vite** (build statique, toujours déployé sur GitHub Pages)
- **TypeScript** (`strict` à terme)
- **Svelte 5** (runes) pour l'interface
- **vite-plugin-pwa** en mode `injectManifest` (Service Worker maison basé sur Workbox)
- **Vitest** pour la logique pure
- Paquet npm **`ble-midi`** (skratchdot) à la place de `js/ble-midi-parser.bundle.js`, qui en est un bundle browserify

On **reste sur la plateforme web** (Web MIDI, Web Bluetooth, Web Audio dans Chrome Android). Pas de natif, pas de Capacitor, pas de React, Next ou Angular.

---

## 2. Règles de travail

1. **Aucun changement fonctionnel ni visuel.** La refonte doit être invisible pour l'utilisateur final : mêmes onglets, mêmes boutons, mêmes couleurs, mêmes comportements, même config. Si un comportement actuel semble être un bug, le signaler sans le corriger dans la foulée : l'ajouter à `docs/bugs.md` avec son diagnostic (l'utilisateur décidera à la fin lesquels corriger).
2. **Une phase à la fois.** À la fin de chaque phase, l'app doit fonctionner. Résume ce qui a été fait, puis enchaîne sur la phase suivante. Décision de l'utilisateur (2026-10-13) : pas de test sur tablette entre les phases, la checklist de non-régression (section 5) est passée **une seule fois, juste avant une fusion dans `main`**. En compensation :
   - à la fin de chaque phase, vérifier automatiquement dans Chromium headless, en paysage et en portrait, que le rendu et les comportements restent identiques à `v1-vanilla` (captures comparées au pixel, popups FX, lecture d'un son, console sans erreur) ;
   - poser un tag local `refonte-phase-N` sur le dernier commit de chaque phase, pour pouvoir retrouver par bisection la phase qui a introduit une régression trouvée sur tablette.
3. **Git**
   - Le travail se fait sur la branche `refonte`, jamais directement sur `main`.
   - Commits petits et fréquents, messages en français, à la manière de l'historique existant.
   - **Ne jamais fusionner dans `main` ni pousser `main` sans accord explicite de l'utilisateur** : un push sur `main` déploie en production, et l'app sert en spectacle.
4. **Garder la doc à jour** : à la fin de chaque jalon, mettre à jour `README.md` et `CLAUDE.md` pour qu'ils décrivent la nouvelle stack (commandes, structure, conventions). Mettre à jour la section « Suivi » de ce fichier à chaque étape terminée.
5. **Respecter le style existant** : noms de fonctions explicites, commentaires en français et de densité comparable au code actuel.
6. Toujours vérifier dans les deux orientations (paysage et portrait).

---

## 3. Étape 0 — Préparation git

Si ce n'est pas déjà fait (vérifier avec `git tag` et `git branch -a`) :

```bash
git switch main
git add CLAUDE.md REFONTE.md && git commit -m "ajout CLAUDE.md et plan de refonte"
git tag -a v1-vanilla -m "Dernière version vanilla JS avant refonte"
git push origin main v1-vanilla
git switch -c refonte
git push -u origin refonte
```

Demander confirmation à l'utilisateur avant les `git push`.

### Mode d'emploi git pendant la refonte (à rappeler à l'utilisateur au besoin)

- **Correctif urgent en production** : `git switch main`, corriger, commit, push (ça déploie), puis `git switch refonte && git merge main`.
- **Fin d'un jalon** : `git switch main && git merge refonte && git push` (avec l'accord de l'utilisateur), puis `git switch refonte` pour continuer.
- **Revenir à l'ancienne version en production** : lancer le workflow « Deploy » à la main depuis l'onglet *Actions* de GitHub, sur le tag `v1-vanilla`. Le tag contient l'ancien `deploy.yml`, qui publie la racine telle quelle, donc ça fonctionne. Prérequis à faire une fois : *Settings → Environments → github-pages → Deployment branches and tags*, ajouter la règle de tag `v*`. En local : `git switch -c v1 v1-vanilla`.
- Les anciennes branches distantes `dev-*` et `fusion_sounds` peuvent être supprimées si l'utilisateur le souhaite (vérifier d'abord qu'elles sont fusionnées).

---

## 4. Les phases

### Jalon 1 — Outillage (fusion dans `main` à la fin)

#### Phase 1 : Vite + modules ES (toujours en JavaScript)

Objectif : même code, mais en modules ES et construit par Vite.

1. Créer `package.json` (scripts `dev`, `build`, `preview`), installer Vite. Ajouter `node_modules/` et `dist/` à `.gitignore`.
2. `vite.config.js` avec `base: './'` (le site est servi sous `/fp30-midi-soundboard/`). Vérifier que `npm run build` puis `npm run preview` fonctionnent avec ce chemin.
3. Déplacer le code dans `src/` :
   - `src/config/` : les quatre fichiers de config, en `export const`.
   - `src/state.js` : l'objet `STATE`, sorti de `app.js`. C'est ce qui supprime la contrainte d'ordre de chargement.
   - `src/midi/`, `src/audio/`, `src/fx/`, `src/app.js`, `src/main.js` (point d'entrée qui appelle `init()`).
   - Remplacer chaque usage d'un global par un `import` explicite. `window.AudioEngineAPI` devient un export.
4. Remplacer `js/ble-midi-parser.bundle.js` par `import … from 'ble-midi'`. Vérifier que l'API utilisée par `bluetoothMIDI.js` est bien la même.
5. Fichiers statiques : `sounds/`, `images/`, les icônes et `manifest.json` vont dans le dossier `public/` de Vite (copié tel quel à la racine de `dist/`).
   - **Attention** : il existe déjà un dossier `public/` qui contient les icônes, référencées en `public/favicon.ico`, etc. Vite sert le contenu de `public/` **à la racine**. Il faut donc corriger les chemins (`favicon.ico`, `pwa-192x192.png`, … dans `index.html` et `manifest.json`), ou ranger les icônes dans `public/icons/` et ajuster.
   - Les chemins de sons et d'images dans la config (`file`, `img`) doivent continuer à fonctionner sans modification de leur valeur si possible.
6. `index.html` : une seule balise `<script type="module" src="/src/main.js">`, les CSS importés depuis `main.js`.
7. Pendant cette phase, désactiver l'enregistrement de l'ancien `sw.js` en dev (il est remplacé en phase 2).
8. Ne pas modifier la logique métier.

**Critères** : `npm run dev` et `npm run build` sans erreur ni avertissement, plus aucun global partagé entre fichiers (hors API du navigateur), checklist de non-régression OK (sauf hors ligne, traité en phase 2).

#### Phase 2 : PWA et déploiement

1. Installer `vite-plugin-pwa` et `workbox-*`. Mode **`injectManifest`** avec un `src/sw.js` maison. Le manifest web peut être généré par le plugin à partir de l'actuel `manifest.json`, en gardant exactement les mêmes valeurs.
2. Le SW doit être publié **sous le nom `sw.js` à la racine du site**, comme aujourd'hui. Comme l'URL ne change pas, le navigateur de la tablette remplacera l'ancien SW par le nouveau.
3. Stratégies du nouveau SW :
   - **Fichiers app** : precache Workbox (liste et révisions générées au build). Supprimer `version.js` et `APP_ASSETS`. La version affichée dans la popup « À propos » vient désormais de `package.json` (injectée par Vite via `define`, par exemple `__APP_VERSION__`).
   - **Sons (`/sounds/`)** : `CacheFirst`, avec un **nom de cache stable** non versionné (par exemple `impro-audio`), plus `CacheableResponsePlugin({ statuses: [200] })` et `RangeRequestsPlugin`, car les éléments `<audio>` font des requêtes `Range`.
   - **Polices Google Fonts** : `StaleWhileRevalidate` ou `CacheFirst`, pour que l'app reste correcte hors ligne.
   - `skipWaiting` + `clientsClaim`, comme l'ancien SW.
   - `cleanupOutdatedCaches()`.
4. **Migration depuis l'ancien SW** : à l'activation, supprimer les anciens caches dont le nom commence par `impro-app-` ou `impro-audio-` (noms de l'ancien `sw.js`). Optionnel : avant de supprimer l'ancien cache audio, recopier ses entrées dans le nouveau cache `impro-audio` pour éviter de retélécharger les sons.
5. Enregistrement du SW dans `main.js` (via `virtual:pwa-register` ou à la main), uniquement en production.
6. `.github/workflows/deploy.yml` : ajouter `actions/setup-node` (Node LTS, cache npm), `npm ci`, `npm run build`, puis publier `dist/` au lieu de `.`. Garder `workflow_dispatch`.
7. Supprimer `start-local.bat` ou le remplacer par un équivalent `npm run dev`. Mettre à jour `README.md` et `CLAUDE.md`, en particulier la section « Releasing / cache invalidation », qui devient : plus rien à faire à la main.

**Critères** : build OK, app installable, fonctionne hors ligne après un premier chargement (app + sons déjà joués), la mise à jour depuis la version `v1-vanilla` installée sur la tablette se fait proprement (vérifier dans DevTools → Application que les anciens caches disparaissent), checklist OK.

**→ Fin du jalon 1** : proposer à l'utilisateur de fusionner dans `main`.

### Jalon 2 — Code

#### Phase 3 : TypeScript

1. Installer TypeScript, `tsconfig.json` (cibler les navigateurs récents, `moduleResolution: bundler`). Commencer avec `strict: false` si nécessaire.
2. Créer `src/types.ts` : `MidiItem` (`pc` 1-based, `msb`, `lsb`…), `MidiTab`, `AudioItem` (`file`, `img?`, `start?`, `end?`, `catClass?`…), `AudioTab` (`cols?`, `gridType?`…), `FxControl` (`key`, `min`, `max`, `step`, `neutral`, `read`, `apply`, `formatValue`), `FxPreset` (`values` partiel ou `null` pour le reset). Le schéma complet est documenté dans `README.md`.
3. **Identifiants stables** : ajouter un champ `id: string` **obligatoire** aux onglets, catégories et tuiles (MIDI et audio), dans les types et dans toute la config. Un slug court et lisible (`'nature'`, `'faune'`, `'pluie'`), unique parmi ses frères et qui ne change plus ensuite, même si le libellé, le fichier ou le patch changent. Aujourd'hui, les éléments ne sont identifiables que par leur libellé, leur `file` ou leur `pc`/`msb`/`lsb`. L'`id` prépare d'éventuelles préférences utilisateur (masquer ou réordonner des tuiles) sans rien changer à l'affichage. Ajouter un test Vitest qui vérifie l'unicité des `id` à chaque niveau.
4. Convertir la config en premier (gain immédiat), puis les autres fichiers un par un.
5. Typer Web MIDI (inclus dans la lib DOM) et Web Bluetooth (`@types/web-bluetooth`).
6. Passer en `strict: true` à la fin de la phase.
7. Ajouter une étape `tsc --noEmit` dans le workflow de déploiement : un build qui ne typecheck pas ne doit jamais partir en production.

**Critères** : `tsc --noEmit` sans erreur en mode strict, aucun `any` non justifié, checklist OK.

#### Phase 4 : séparer les moteurs de l'interface et unifier les FX

1. **`src/midi/`** : `sendMidi`, l'envoi de patch, de volume et de all-notes-off, la connexion USB et la classe `BluetoothMIDI`. Plus aucun accès au DOM. Exposer l'état de connexion par des événements ou des callbacks.
2. **`src/audio/`** : `AudioEngine`, `MediaElementTrack`, lecture, fades, boucle de progression. Plus aucun accès au DOM : la mise à jour des barres de progression et des sliders passe par des événements ou par l'état partagé.
3. **`src/fx/`** : **une seule** implémentation de la logique des presets, paramétrée par le tableau de contrôles. Elle doit couvrir ce que font aujourd'hui en double les fonctions `build…PresetTargetValues`, `…TargetsMatchCurrent`, `infer…PresetKey`, `clamp…Value`, `animate…ToValues`, `is…AnyControlModified` et `reset…Effects`. Règles à conserver :
   - les `values` d'un preset ne listent que les contrôles qu'il modifie, et les autres reviennent à leur `neutral` (pas à leur position actuelle) ;
   - `values: null` est le preset de reset ;
   - le preset actif est déduit des valeurs courantes, pour que la surbrillance revienne après un changement d'onglet ou une réouverture de la popup ;
   - l'état FX MIDI est ce que l'app a envoyé en dernier (jamais relu depuis le piano), et l'état FX audio est lu via `getCurrentSettings()` du moteur.
4. Les deux overlays (MIDI et audio) utilisent ce module commun. Il ne doit rester dans chacun que ce qui est vraiment spécifique.
5. Installer Vitest et écrire des tests pour : le calcul des cibles d'un preset, l'inférence du preset actif, le clamp, la conversion `pc` 1-based → 0-based et les octets MIDI envoyés pour un patch, le formatage du temps, et éventuellement le parsing BLE.
6. Ajouter `npm test` dans le workflow de déploiement.

**Critères** : les fichiers de `midi/`, `audio/` et `fx/` n'importent rien du DOM ni de l'interface, tests verts, checklist OK.

**→ Fin du jalon 2** : proposer la fusion dans `main`.

### Jalon 3 — Interface

#### Phase 5 : Svelte 5, composant par composant

1. Installer Svelte 5 et `@sveltejs/vite-plugin-svelte`.
2. `src/state.svelte.ts` : l'état partagé en runes (`$state`), qui remplace l'objet `STATE`.
3. **Accès à la config par une fonction** : les composants ne lisent jamais `MIDI_TABS` / `AUDIO_TABS` directement, mais passent par un module unique (par exemple `src/config/tabs.ts` avec `getMidiTabs()` / `getAudioTabs()`). Pour l'instant, ces fonctions renvoient la config telle quelle. Plus tard, c'est le seul endroit à modifier pour appliquer des préférences utilisateur (tuiles masquées, ordre), sans toucher aux composants. Les boucles `{#each}` utilisent l'`id` comme clé (`{#each items as item (item.id)}`).
4. Migrer **progressivement** : un composant Svelte peut être monté (`mount`) dans un conteneur existant, donc l'app reste fonctionnelle entre chaque composant. Ordre suggéré :
   1. `FxOverlay.svelte` : **un seul** composant générique pour MIDI et audio, avec les contrôles, les presets et les boutons de la barre d'outils.
   2. `Transport.svelte` / `SeekBar.svelte` (lecture/pause, seek par glisser).
   3. `SoundButton.svelte`, `AudioPanel.svelte`.
   4. `MidiPanel.svelte` (y compris la réorganisation en portrait, aujourd'hui `rearrangeMidiGrid`).
   5. `TabNav.svelte`, `AboutPopup.svelte`, le bouton d'arrêt d'urgence.
   6. `App.svelte`, qui remplace `buildUI()` et `init()`.
5. L'égalisation des hauteurs de boutons (`equalizeMidiButtons`, `equalizeAudioButtons` + `ResizeObserver`) : la remplacer par du CSS Grid (`grid-auto-rows: 1fr`, container queries) **si le rendu est strictement identique**. Sinon, la garder sous forme d'action Svelte.
6. CSS : découper `css/style.css` et `css/style.fx.css` dans les composants (styles scopés) au fil de la migration. Garder un fichier global pour les variables, le reset et les polices.
7. Le Wake Lock et l'enregistrement du SW restent dans `main.ts` ou dans un module dédié.

**Critères** : plus aucune construction de DOM impérative (`createElement`, `innerHTML`) hors cas justifié, rendu identique en paysage et en portrait, checklist OK.

#### Phase 6 : finitions

1. Supprimer le code mort, les anciens dossiers `js/` et `css/` s'ils sont vides, `version.js`, l'ancien `sw.js`.
2. `README.md` : nouvelle stack, commandes, structure, schéma de config (toujours valable), procédure de release.
3. `CLAUDE.md` : réécrire les sections Commands, Releasing et Architecture pour la nouvelle structure.
4. Passer en revue `docs/bugs.md` avec l'utilisateur : il décide quels bugs corriger, et quand (avant ou après la fusion).
5. Repasser la checklist complète en conditions réelles (piano en USB **et** en BLE, tablette dans les deux orientations, hors ligne).
6. **→ Fin du jalon 3** : proposer la fusion dans `main`.

---

## 5. Checklist de non-régression (manuelle, sur la tablette)

À créer dans `docs/checklist.md` dès la phase 1, à compléter si besoin, et à faire passer à l'utilisateur à la fin de chaque phase.

- [ ] Chargement de l'app, onglets affichés, navigation entre onglets
- [ ] Connexion du piano en **USB** (Web MIDI) : sélection de l'entrée et de la sortie
- [ ] Connexion du piano en **Bluetooth** (BLE MIDI), y compris le loopback des notes jouées
- [ ] Sélection d'instruments : le bon son sur le piano (Program Change + Bank Select MSB/LSB)
- [ ] Volume MIDI, all-notes-off, bouton d'arrêt d'urgence
- [ ] Popup FX MIDI : sliders, presets, reset, surbrillance du preset après fermeture/réouverture et après changement d'onglet
- [ ] Lecture de clips audio, y compris ceux avec `start` / `end`
- [ ] Fades, stop, lecture/pause, seek par clic et par glisser, barre de progression
- [ ] Popup FX audio : sliders, presets, reset, surbrillance, effet audible
- [ ] Onglet animaux (`gridType: 'animals'`) et onglets avec `cols`
- [ ] Mode **paysage** et mode **portrait** : mise en page, hauteurs de boutons égalisées, réorganisation des grilles MIDI en portrait
- [ ] Popup « À propos » et numéro de version
- [ ] Wake Lock : l'écran ne se met pas en veille
- [ ] **Hors ligne** (mode avion) : l'app se lance, les sons déjà joués une fois se relancent
- [ ] Mise à jour : après un déploiement, la tablette récupère la nouvelle version

---

## 6. Tester sur la tablette pendant le développement

Web MIDI, Web Bluetooth et les Service Workers exigent un **contexte sécurisé**. `localhost` en est un, mais `http://<ip-du-pc>:5173` non. `adb reverse` n'est pas utilisable puisque le port USB de la tablette sert au piano. Méthode recommandée :

1. Sur le PC : `npm run dev -- --host` (ou `npm run build && npm run preview -- --host` pour tester le SW).
2. Sur la tablette : ouvrir `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, y ajouter `http://<ip-du-pc>:5173` (et le port de `preview`), puis relancer Chrome.

Le PC tourne sous WSL : si la tablette n'arrive pas à joindre le serveur, vérifier la redirection de port Windows → WSL (ou le mode réseau `mirrored` de WSL) et le pare-feu Windows.

---

## 7. Suivi

À mettre à jour par l'IA à chaque étape terminée (date + commit).

- [x] Étape 0 : tag `v1-vanilla` et branche `refonte` (2026-10-13)
- [x] Phase 1 : Vite + modules ES (2026-10-13, `b03c234`), tag `refonte-phase-1`
  - Écart au plan : le paquet npm `ble-midi` n'est pas utilisable (CLI Node avec dépendances natives noble/bleno/midi, `npm install` échoue, `parsePacket` non exporté). Avec l'accord de l'utilisateur, le parseur est porté en module ES dans `src/midi/ble-midi-parser.js` (MIT, origine indiquée).
  - Node 18 en local : Vite 6 (Vite 7 demande Node ≥ 20.19).
  - Bug constaté (non corrigé) : voir `docs/bugs.md` n° 1.
  - Vérifié en Chromium headless (paysage 1280×800 et portrait 800×1280) : captures des 4 onglets identiques au pixel près à `v1-vanilla`, popups FX, lecture d'un son et popup « À propos » OK, aucune erreur console.
- [x] Phase 2 : PWA et déploiement (2026-10-13, `fe1f760` + `62d2711`), tag `refonte-phase-2`
  - Node 24 LTS épinglé dans `.nvmrc` (`vite-plugin-pwa` 2 et Workbox 7.4 demandent Node ≥ 20) ; le défaut nvm de l'utilisateur reste Node 18.
  - Version passée à 1.7.0 pour distinguer la nouvelle version de la v1 sur la tablette.
  - Sons : au premier accès, le SW télécharge le fichier entier sans en-tête `Range` (GitHub Pages répond 206 aux requêtes Range des `<audio>`, et une réponse 206 ne peut pas être mise en cache), puis sert les plages depuis le cache.
  - Bug de l'ancien SW (sons jamais mis en cache sur GitHub Pages) : voir `docs/bugs.md` n° 4.
  - Vérifié en Chromium headless avec un serveur qui répond en 206 : passage v1 → nouvelle version (anciens caches supprimés, son de l'ancien cache recopié), app lancée serveur arrêté, sons déjà joués relancés et seek hors ligne OK, son jamais joué marqué manquant ; captures identiques à `v1-vanilla` hormis le numéro de version.
- [ ] **Jalon 1 fusionné dans `main`**
- [x] Phase 3 : TypeScript (2026-10-13, `4745932` → `580c8d6` + doc), tag `refonte-phase-3`
  - `strict: true` dès la conversion, aucun `any` ; trois projets `tsc` (app / Service Worker en lib WebWorker / `vite.config.ts` en Node), lancés par `npm run typecheck` puis dans le workflow avec `npm test`.
  - `id` générés depuis le libellé (onglet Films : nom de l'image de couverture), y compris sur les entrées commentées ; seul ajustement manuel : `piano` (actif) / `piano-gp1` (commenté).
  - Vitest 5 installé dès cette phase pour le test d'unicité des `id` (Vitest 3 remontait des alertes `npm audit` critiques via tinypool).
  - Bugs constatés (non corrigés) : voir `docs/bugs.md` n° 2 et 3.
  - Vérifié en Chromium headless : captures identiques à `v1-vanilla` (aux variations d'animation près, présentes aussi entre deux captures de la v1), scénario SW/hors ligne de la phase 2 toujours OK.
- [x] Phase 4 : moteurs séparés, FX unifiés, tests (2026-10-13, `f0e2fcd` + `429acce` + doc), tag `refonte-phase-4`
  - `midi/`, `audio/`, `fx/` sans DOM ni import de l'interface : l'interface suit les moteurs par événements (`midiConnectionEvents`, `playbackEvents`, `src/events.ts`). Restent dans `audio/` les API navigateur de lecture (`AudioContext`, élément `<audio>` non attaché au document, `window.location`).
  - Une seule logique de presets (`fx/fx-presets.ts`, pure et testée) et une seule popup (`ui/fx-overlay.ts`, classe `FxOverlay`), instanciée pour le MIDI et l'audio dans `ui/fx-overlays.ts` avec seulement ce qui diffère. Les attributs `data-*` d'origine sont conservés. Supprimé : le bloc HTML commenté « canal / piste » des en-têtes de popup et son code mort (`channelEl`, `trackEl`, jamais affichés).
  - `STATE` ne contient plus d'élément DOM : `currentSoundBtn` → `currentSoundItem` (l'`AudioItem`), `activeInstBtn` et les drapeaux d'ouverture des popups passent dans l'interface.
  - 46 tests Vitest (presets, inférence, clamp, octets MIDI d'un patch et routage USB/BT, arrêt d'urgence, temps de lecture et seek, parseur BLE, validité des presets et patchs de la config).
  - Scripts de non-régression automatique versionnés dans `tools/regression/` (captures, scénario de 23 étapes comparé au DOM de la v1, mise à jour du SW et hors ligne) : tout identique à `v1-vanilla` en paysage et en portrait.
- [ ] **Jalon 2 fusionné dans `main`**
- [x] Phase 5 : Svelte 5 (2026-10-13, `0c5c4cb` → `b256dfd` + doc), tag `refonte-phase-5`
  - `@sveltejs/vite-plugin-svelte` 6 (la 7 demande Vite 8 ; on reste sur Vite 6). `npm run typecheck` lance `svelte-check --fail-on-warnings` sur l'app.
  - Migration progressive : d'abord la popup d'effets (`FxOverlay.svelte` + `FxOverlayController`), puis toute l'interface (`App.svelte`, `ui/components/`). Plus aucune construction de DOM impérative : il reste seulement des mesures (hauteur des boutons, position de la popup sur la grille active).
  - `state.svelte.ts` : `STATE` en runes ; `$state.raw` pour les objets comparés par identité ou fournis par le navigateur (ports MIDI, BLE, piste, son courant), qui ne doivent pas passer par un proxy. Accès à la config par `config/tabs.ts`, `{#each}` indexés par `id`.
  - Égalisation des hauteurs de boutons : gardée en JS (`layout.svelte.ts`). Un équivalent CSS Grid ne donnerait pas exactement le même rendu (le calcul dépend de la hauteur réelle des titres et du nombre de rangées par colonne), ce qui est la condition posée par le brief.
  - CSS : `css/global.css` (variables, reset, page, curseur `.vol-slider` partagé par le volume et les popups) ; le reste est scopé dans les composants. Chaque famille de règles reste dans un seul composant, dans son ordre d'origine : Svelte ajoute la même spécificité (une classe) à toutes les règles scopées, donc la cascade ne change pas. Deux composants de mise en page ajoutés, sans changement du DOM : `Panel` (cadre et barre de contrôles communs) et `FxToolbar` (boutons Effets / Reset). Supprimés car jamais utilisés : `.icon-stop`, `#settings-btn > *`. Règles gardées pour un balisage jamais rendu : `.paused` (bug n° 5) et `.fx-track`, en `:global(...)`.
  - Bugs constatés (non corrigés, comportement de la v1 conservé) : voir `docs/bugs.md` n° 5 et 6, confirmés par le scénario sur `v1-vanilla`.
  - Vérifié en Chromium headless : scénario de 23 étapes identique à `v1-vanilla` en paysage et en portrait, captures identiques (hors variations d'animation et numéro de version), mise à jour du SW et hors ligne OK. Découpage du CSS vérifié avec un nouvel outil (`tools/regression/styles.sh`) : styles calculés de tous les éléments identiques avant et après, dans une vingtaine d'états et sur 7 tailles d'écran.
- [x] Phase 6 : finitions (2026-10-13), tag `refonte-phase-6`
  - [x] Code mort et doc (2026-10-13) : anciens `js/`, `css/`, `version.js` et `sw.js` déjà supprimés aux phases précédentes ; dépendance inutilisée `workbox-window` retirée ; commentaires périmés de `vite.config.ts` corrigés ; README (lecture audio, numéro de version à incrémenter) ; emplacements v1 / refonte des bugs mis à jour dans `docs/bugs.md`. Aucun export mort (ceux non importés ailleurs sont utilisés dans leur module). Non-régression en Chromium headless inchangée.
  - [x] Revue de `docs/bugs.md` avec l'utilisateur (2026-10-13) : bugs n° 1, 2, 3, 5 et 6 à corriger **après** la fusion, un commit par bug
  - [x] Checklist sur la tablette (2026-10-13) : passée à la main par l'utilisateur, servie par `npm run preview` via `adb reverse`, piano en Bluetooth ; jugée « à peu près bonne » et validée par l'utilisateur, sans passage exhaustif (le scénario automatisé sur la tablette n'a pas pu tourner, batterie vide). La ligne « Mise à jour » ne se vérifie qu'après le déploiement.
- [ ] **Jalon 3 fusionné dans `main`**
