# Revue de code — version 1.8.0

Mise à jour du 2026-11-05, pour la version 1.8.0 (branche `canal-4`). Ce document remplace les revues de la 1.7.2 (2026-10-14) et de la 1.7.3 (2026-11-05). Leurs textes complets restent dans l'historique git : `git show f79519d:docs/revue-code.md` (1.7.2) et `git show 3583b57:docs/revue-code-1.7.3.md` (1.7.3).

**Périmètre** : tout `src/`, `vite.config.ts`, `index.html`, `public/manifest.json`, le workflow de déploiement, `tools/regression/`, `global.css` et les dépendances.

**Méthode** : les constats des deux revues ont été repris un par un sur le code de la 1.8.0. Ce qui a été corrigé est résumé en fin de document. Ce qui reste est renuméroté ci-dessous, avec les emplacements à jour. Le code nouveau de la 1.8.0 (canal 4, SysEx Roland, contrôleur Bluetooth) a été vérifié sur le PC avec le piano, en Bluetooth et en USB, et il est couvert par les tests unitaires (94 tests). Il n'a pas encore été vérifié sur la tablette. Ce qui demande l'appareil est marqué **à vérifier**.

Les bugs déjà inscrits dans `docs/bugs.md` y gardent leur numéro, rappelé ici.

**Suite donnée (2026-11-05, version 1.9.0, branche `revue-1.8`)** : l'utilisateur a décidé point par point (colonne « Suite » ci-dessous). Les constats sans numéro dans `bugs.md` y ont été inscrits (n° 20 à 23) avant d'être corrigés. Les constats détaillés plus bas sont gardés tels qu'écrits pour la 1.8.0.

---

## Synthèse

Le côté **piano** (MIDI, Bluetooth, USB) est traité. La 1.8.0 envoie patchs et effets sur le canal 4, celui du son du clavier : plus de Local Off, plus de renvoi des notes au piano, donc plus de notes tenues. La reconnexion Bluetooth est automatique, l'état du piano est renvoyé à chaque connexion, et le câble USB est suivi. Il reste un point : la queue d'effet après l'arrêt d'urgence.

Le reste concerne l'**audio**, le **hors ligne** et l'**affichage**. Aucun de ces points n'a été touché depuis la 1.7.2.

| # | Constat | Gravité | Certitude | `bugs.md` | Suite (1.9.0) |
|---|---------|---------|-----------|-----------|---------------|
| 1 | Arrêt d'urgence : la queue d'effet d'un orgue continue de sonner | Moyenne | Constaté ; cause **à vérifier** | n° 18 | **Plus constaté** en 1.8.0 (essai de l'utilisateur sur le piano). Le fondu de sortie des sons au STOP est voulu |
| 2 | Un son remplacé sous le même nom n'est jamais mis à jour sur la tablette | Moyenne | Code | n° 14 | **Laissé** : les sons ne sont jamais remplacés |
| 3 | Bouton « Vider le cache et recharger » : il ne vide aucun cache | Faible | Code | n° 7 | **Corrigé** : « Mettre à jour l'application » (`src/app-update.ts`), sans désinscrire le SW, rien rechargé hors ligne |
| 4 | Reprise après pause puis Stop rapide : `TypeError` | Faible | Code | n° 10 | **Corrigé** |
| 5 | Volume déplacé pendant un fondu d'entrée : ignoré | Faible | Code | n° 11 | **Corrigé** |
| 6 | Volume appliqué deux fois (élément `<audio>` et gain master) | Faible | **À vérifier** | — | **Laissé de côté** |
| 7 | `MediaElementTrack.load()` rend la main avant la fin du chargement | Faible | Code | n° 20 | **Corrigé** |
| 8 | Statut Wake Lock « actif » affiché après sa libération | Faible | Code | n° 12 | **Corrigé** |
| 9 | Pas de limiteur en sortie du moteur audio | Faible | **À vérifier** à l'oreille | n° 21 | **Corrigé** (grésillement constaté par l'utilisateur) : limiteur compensé, transparent sous −2 dBFS (mesuré). À écouter sur la tablette |
| 10 | Une piste libérée ne libère pas son élément `<audio>` | Faible | **À vérifier** | n° 22 | **Corrigé** |
| 11 | `#app` en `100vh` : bas de l'écran coupé dans un onglet Chrome | Faible | Code | n° 23 | **Corrigé** (gêne constatée par l'utilisateur) |
| 12 | Cache des sons non persistant, préchargement à la main | Amélioration | — | — | **Fait** : `persist()` au démarrage, « Télécharger tous les sons » (`src/offline.ts`) |
| 13 | Polices Google chargées depuis le réseau | Amélioration | — | — | **Fait** : `@fontsource/*`, dans le precache, rendu identique au pixel |
| 14 | Bluetooth au lancement : piano non retrouvé après un rechargement (Edge) | Amélioration | Constaté sur le PC ; tablette **à vérifier** | — | **Fait** : piano proposé sous son nom, sélecteur limité à ce piano sans `getDevices`. **Pas de connexion automatique** (décision : ne pas prendre le piano à un autre appareil) |
| 15 | Curseurs de volume : un appui saute à la position touchée | Amélioration | À décider | — | **Voulu** : glisser ou toucher doivent marcher tous les deux |
| 16 | Fin d'un son avec `end` non détectée en arrière-plan | Très faible | Code | — | **Non** (pas de correctif à base de minuterie) |
| 17 | Code mort et nœuds audio inutilisés | Dette | — | — | **Plus tard**. S'y ajoute `formatValue`, qui ne sert plus qu'à `aria-valuetext` |

Constats ajoutés par l'utilisateur, faits en 1.9.0 :
- **Reset couplé** (bug n° 19) : les deux Reset remettaient à zéro les effets piano **et** audio, depuis le commit `78bbbd7` du 2026-04-29 (version vanilla, trois jours après la création des boutons, qui étaient séparés), gardé par la refonte. Chaque panneau a maintenant son Reset et son témoin.
- **Popup des effets** : valeur chiffrée et trigramme retirés, nom du curseur plus lisible.

---

## Constats détaillés

### 1. Arrêt d'urgence : la queue d'effet continue de sonner (bug n° 18)

- **Où** : `src/midi/midi.ts:97` (`sendEmergencyStopMidi`)
- **Constaté** : sur le PC, en Bluetooth, avec un orgue et un effet réglé haut, on entend encore l'orgue « dans l'église » après l'appui sur STOP.
- **Ce qui est déjà fait (1.8.0)** : le canal du clavier passe en premier, avec All Sound Off (CC120), puis All Notes Off et Reset All Controllers. Les autres canaux ne reçoivent qu'All Notes Off et Reset All Controllers. La file Bluetooth est aussi bien plus courte, puisque les animations n'envoient plus que les valeurs qui changent.
- **Hypothèses** :
  - la **réverbération du piano (Ambiance)** est un effet général, hors canal, et CC120 ne la coupe pas ;
  - ou un **Release (CC72) élevé** fait s'éteindre les notes lentement.
- **À vérifier** sur le piano : le protocole est dans `docs/bugs.md`, n° 18.
- **Pistes** :
  - couper l'Ambiance (SysEx, 0) à l'arrêt d'urgence, puis la rétablir plus tard (au prochain instrument choisi, ou après quelques secondes) ;
  - remettre Release au neutre (CC72 = 64) avant All Sound Off ;
  - en Bluetooth, vider la file d'écriture en attente avant l'arrêt. L'arrêt passe aujourd'hui après ce qui attend déjà, même si c'est peu de chose depuis la correction du bug n° 9.

### 2. Son remplacé sous le même nom : jamais mis à jour (bug n° 14)

- **Où** : `src/sw.ts:57` (route `/sounds/`, `CacheFirst` dans `impro-audio`, sans révision ni expiration). C'est pareil pour `/images/` (`:72`).
- **Scénario** : on remplace `sounds/films/(Saw) Theme.mp3` par une meilleure version sous le même nom, on ajuste son `start` dans la configuration, et on publie.
- **Conséquence** : le Service Worker sert toujours l'ancien fichier. Le nouveau `start` s'applique donc à l'ancien son, qui démarre au mauvais endroit, sans aucun message. Seul l'effacement des données du site rétablit le bon fichier, mais il efface aussi tous les autres sons.
- **Pistes** :
  - une règle de travail dans le README : un fichier modifié change de nom ;
  - versionner l'URL dans la configuration (`?v=2`) ;
  - ou nommer le cache audio d'après la liste des fichiers, et y recopier les entrées inchangées.

### 3. Bouton « Vider le cache et recharger » (bug n° 7)

- **Où** : popup À propos (`src/ui/components/AboutPopup.svelte`)
- **Diagnostic** : le libellé promet de vider un cache, mais le bouton n'en vide aucun (voir `docs/bugs.md`). Il ne règle donc pas non plus le n° 2.
- **Piste** : renommer le bouton selon ce qu'il fait vraiment, ou lui faire vider les caches de l'application, à décider avec le n° 2.

### 4. Reprise après pause, puis Stop rapide : `TypeError` (bug n° 10)

- **Où** : `src/audio/playback.ts:225` (`togglePlayPause`), callback `.then()` à la ligne 231
- **Scénario** : un son est en pause. On appuie sur ▶, puis sur STOP (ou sur un autre son) avant que `play()` ne soit résolu.
- **Diagnostic** : le callback relit `STATE.currentAudio!` et `STATE.currentSoundItem!` sans vérifier qu'ils sont encore là.
  - Après un STOP, ils valent `null`, et le callback lève une `TypeError`.
  - Si un autre son a été lancé entre-temps, le callback lui applique un fondu de 150 ms qui ne le concerne pas.
  - Il n'y a pas de `.catch()` : un échec de `play()` laisse une promesse rejetée sans gestionnaire.
- **Piste** : garder la piste et le son dans des variables avant `play()`, puis vérifier `STATE.currentAudio === audio` dans le `.then()`, comme le fait `playSound`. Ajouter un `.catch()`.

### 5. Volume déplacé pendant un fondu d'entrée : ignoré (bug n° 11)

- **Où** : `src/audio/playback.ts:56` (`fadeAudio`) et `:263` (`setAudioVolume`)
- **Scénario** : on lance un son et on baisse aussitôt le volume, pendant les 300 ms du fondu d'entrée (ou les 150 ms d'une reprise).
- **Diagnostic** : le fondu en cours écrase la nouvelle valeur à l'image suivante. Il termine sur la cible qu'il avait au départ. Le curseur affiche la nouvelle valeur, mais le son reste à l'ancienne.
- **Piste** : dans `setAudioVolume`, annuler le fondu d'entrée en cours (pas un fondu de sortie). Autre solution : faire lire `STATE.audioVolume` à chaque pas du fondu d'entrée.

### 6. Volume appliqué deux fois (à vérifier)

- **Où** : `src/audio/audio-engine.ts:519` (setter `volume` de `MediaElementTrack`) et `:250` (`setMasterVolume`)
- **Diagnostic** : le volume est écrit sur le gain master du graphe **et** sur `audio.volume`. Si Chrome applique `audio.volume` avant le `MediaElementAudioSourceNode`, le gain effectif est v². À 50 % sur le curseur, on entendrait −12 dB au lieu de −6 dB.
- **À vérifier** : comparer un son à 50 % avec et sans `audio.volume = 1` forcé.
- **Piste** : ne garder qu'une commande (le gain master), et écrire la courbe au carré explicitement si elle plaît. Comme cela change le rendu, c'est à décider.

### 7. `MediaElementTrack.load()` rend la main trop tôt

- **Où** : `src/audio/audio-engine.ts:537` à `:578`, appelé par `playSound` (`playback.ts:198`)
- **Diagnostic** : `load()` renvoie `this` (ligne 578), pas la promesse de chargement. `await audio.load()` n'attend donc rien. Si le fichier échoue avant le second appel (dans `play()`), la promesse rejetée n'est attendue par personne (« Uncaught (in promise) »), et le fichier est redemandé.
- **Piste** : `return this._loadPromise;`, puis vérifier avec `tools/regression`.

### 8. Statut Wake Lock « actif » après sa libération (bug n° 12)

- **Où** : `src/wake-lock.ts:10`, lu par `src/ui/components/AboutPopup.svelte:23`
- **Diagnostic** : le navigateur libère le verrou quand la page passe en arrière-plan. `STATE.wakeLock` garde l'objet libéré : si la nouvelle demande échoue, la popup affiche toujours « actif ✓ ».
- **Piste** : tester `!STATE.wakeLock.released`, ou remettre `STATE.wakeLock` à `null` sur l'événement `release`.

### 9. Pas de limiteur en sortie (à vérifier à l'oreille)

- **Où** : `src/audio/audio-engine.ts:165` (`masterGain → destination`) et `:218` (`getReverbWetGain`, jusqu'à ×1,38)
- **Diagnostic** : la réverbération, le delay et les boosts d'égaliseur (jusqu'à +15 dB) s'ajoutent au signal sec, et rien ne limite la sortie. Le compresseur du graphe est avant les effets, avec un ratio de 1 : il est inactif. Au-delà de 0 dBFS, le son sature.
- **À vérifier** : un son fort, volume à 100 %, réverbération à 100 %, basses à +15 dB.
- **Piste** : un `DynamicsCompressorNode` réglé en limiteur (seuil −1 dB, ratio 20, attaque courte), entre `masterGain` et la sortie, à la place du compresseur inutilisé.

### 10. Une piste libérée garde son élément `<audio>` (à vérifier)

- **Où** : `src/audio/audio-engine.ts:607` (`dispose`)
- **Diagnostic** : `dispose()` met en pause et déconnecte, sans vider la source. Chaque son joué laisse un élément `<audio>`, avec son décodeur, jusqu'au ramasse-miettes. Or Chrome Android limite le nombre de lecteurs média simultanés.
- **À vérifier** : une centaine de sons d'affilée sur la tablette, puis regarder la mémoire, et si un son finit par refuser de démarrer.
- **Piste** : à la fin de `dispose()`, `this.audio.removeAttribute('src'); this.audio.load();`.

### 11. `#app` en `100vh`

- **Où** : `src/css/global.css:55`
- **Diagnostic** : dans un onglet Chrome Android, `100vh` compte aussi la barre d'adresse. La dernière rangée de boutons passe alors sous l'écran. En mode installé (PWA), le problème ne se pose pas.
- **Piste** : `height: 100dvh`, précédé de `100vh` en repli. À vérifier avec `tools/regression/styles.sh`.

### 12. Hors ligne : cache non persistant, préchargement à la main

- **Constat** : `navigator.storage.persist()` n'est appelé nulle part, donc Chrome peut effacer les caches (104 Mo, 74 sons) s'il manque de place. De plus, un son qu'on a oublié de jouer avant le spectacle n'est pas disponible hors ligne.
- **Pistes** :
  - appeler `navigator.storage.persist()` au démarrage, et afficher le résultat dans la popup À propos ;
  - ajouter un bouton « Télécharger tous les sons pour le hors ligne », avec un compteur « 74 / 74 sons disponibles ».

### 13. Polices hébergées par Google

`index.html:17-18` charge Rajdhani et IBM Plex Mono depuis `fonts.googleapis.com`. Au tout premier lancement, le Service Worker ne contrôle pas encore la page, donc les polices ne sont mises en cache qu'au lancement suivant. Les héberger dans `public/` (ou les importer en CSS) les ferait entrer dans le precache.

### 14. Bluetooth au lancement de l'application

- **Constaté** (sur le PC, Edge, 2026-11-05) : après un rechargement de la page, « ᛒ FP-30X » n'est pas proposé, et il faut repasser par le sélecteur d'appareil. `navigator.bluetooth.getDevices()`, qui retrouve un appareil déjà autorisé, n'existe pas dans Edge sans réglage expérimental. `restore()` (`src/midi/bluetoothMIDI.ts`) n'a donc rien à faire.
- **À vérifier** sur la tablette (Chrome Android).
- **À décider** : faut-il une connexion Bluetooth automatique au lancement, quand le piano est retrouvé ? Elle n'est pas faite aujourd'hui.

### 15. Curseurs de volume : saut à la position touchée

Un `<input type="range">` saute à l'endroit touché. Un effleurement accidentel peut faire passer le volume audio de 30 % à 100 % en plein spectacle. On pourrait ne réagir qu'à un glissement parti de la poignée, mais cela change le geste. C'est à décider.

### 16. Fin d'un son en arrière-plan

La fin d'un son avec `end` est détectée dans la boucle `requestAnimationFrame` (`src/audio/playback.ts:96` à `:114`). Si la page passe en arrière-plan, la boucle s'arrête et le son dépasse sa fin. Le Wake Lock rend le cas rare.

### 17. Code mort et nœuds audio inutilisés

- **Distorsion et compresseur** (`audio-engine.ts:113` et `:115`) : aucun contrôle ne les règle, mais ils traitent le signal en permanence. La convolution de la réverbération (4,8 s, stéréo) tourne même quand le mix est à 0. Sur la tablette, c'est du CPU qui pourrait manquer. Pistes :
  - retirer distorsion et compresseur ;
  - ne connecter réverbération et delay que si leur mix est supérieur à 0.
- **`AudioEngineAPI`** : `init`, `load`, `resetSettings`, `restoreEffectSettings`, `getDefaultSettings`, `setEQ`, `setCompressor` et `setDistortionAmount` ne sont appelés par personne.
- **Branches mortes** :
  - `canUseMediaElementSource` (`audio-engine.ts:93`) n'est faux qu'en `file:`, où l'application ne tourne pas ;
  - le repli `webkitAudioContext` (`:101`) est inutile, la cible étant Chrome.
- **`afterSync` de la popup audio** (`src/ui/fx-overlays.svelte.ts:60`) : il ramène un passe-bas supérieur à 20 kHz, ce qui ne peut plus arriver.
- **Parseur BLE** (`src/midi/ble-midi-parser.ts`) : depuis la 1.8.0, il ne sert plus qu'au journal `MIDI IN (BT)` de la console. Un SysEx n'y annule pas le running status (`parseSysex`, `:169`), mais c'est sans effet. On peut le garder pour le diagnostic, ou le retirer.
- **Petits points** :
  - `applyAudioFxValue` se contente d'appeler `control.apply` ;
  - `MIDI_CHANNEL` est le seul champ en majuscules d'`AppState` ;
  - `EmergencyStopButton.svelte:11` fabrique un identifiant avec `Math.random()`, alors que Svelte 5 fournit `$props.id()`.
- **Attributs `data-*` des popups** : les différences entre les deux popups (`FxOverlayAttributes`) ne servent qu'à `tools/regression`. On peut les garder.

---

## Tests à ajouter

1. ~~`togglePlayPause` suivi d'un `stopSound` avant la résolution de `play()` (n° 4)~~ : écrit en 1.9.0 (`playback.test.ts`).
2. ~~`setAudioVolume` pendant un fondu d'entrée (n° 5)~~ : écrit en 1.9.0.
3. L'arrêt d'urgence : ordre et contenu des messages.

Écrits en 1.9.0 : `audio-engine.test.ts` (chargement et libération d'une piste, gain du limiteur), `wake-lock.test.ts`, `app-update.test.ts`, `offline.test.ts`, et dans `bluetoothMIDI.test.ts` le piano proposé sans `getDevices` (118 tests).

---

## Corrigé depuis la 1.7.2

| Constat (revue d'origine) | Correction | `bugs.md` |
|---------------------------|------------|-----------|
| Parseur BLE : messages de 1 ou 2 octets mal décodés (1.7.2, n° 1) | 1.7.3 : chaque statut a sa longueur de données | n° 8 |
| Notes tenues en Bluetooth (1.7.3, n° 1) | 1.8.0 : canal 4 ; plus de Local Off ni de renvoi des notes au piano | n° 8 |
| Animation des effets piano : 7 CC par image (1.7.2, n° 2) | 1.8.0 : seules les valeurs qui changent sont envoyées, et rien quand les cibles sont atteintes | n° 9 |
| Arrêt d'urgence : 32 écritures derrière la file (1.7.2, n° 3) | 1.8.0 : canal du clavier en premier, avec All Sound Off ; il reste la queue d'effet (n° 1 ci-dessus) | n° 18 |
| Débranchement et branchement USB non suivis (1.7.2, n° 4) | 1.8.0 : port débranché oublié, piano branché après le lancement connecté | n° 17 |
| Pas de reconnexion BLE automatique (1.7.2, n° 10) | 1.8.0 : contrôleur repris de chord-finder (reconnexion pendant 20 s, piano connu, reconnexion sans sélecteur) | n° 15, 16 |
| Instrument et effets non renvoyés à la connexion (1.7.3, n° 2) | 1.8.0 : contrôle à distance, volume, instrument et effets renvoyés à chaque connexion | n° 13 |
| Loopback USB sans commentaire (1.7.2, divers) | 1.8.0 : loopback retiré | — |
| Volume MIDI : un CC7 par événement, qui charge la file BLE (1.7.2, divers) | Sans objet depuis que la file ne se remplit plus pendant les animations | — |

Écrits en 1.8.0 :
- les tests du contrôleur Bluetooth (`bluetoothMIDI.test.ts`) ;
- ceux des choix de connexion (`connection.test.ts`) ;
- ceux de l'animation des popups (`fx-overlay.test.ts`) ;
- ceux des SysEx Roland (`midi.test.ts`).

---

## Outils, build, dépendances

- `tools/regression/` compare avec le dernier tag (`v1.7.2` tant que `v1.7.3` n'est pas posé). La 1.8.0 sera taguée après le test sur la tablette en production.
- Dépendances : aucune vulnérabilité à la revue 1.7.3. Le 2026-11-05, `npm audit` signale des failles modérées dans des dépendances de build (`deepmerge`, `fast-uri`, `glob`, tirées par l'outillage Workbox), rien qui parte dans l'application publiée. À traiter avec les mises à jour majeures. Des versions majeures existent (Vite 8, TypeScript 7, `vite-plugin-svelte` 7) : à prévoir entre deux saisons de spectacles.

## Points positifs

- Les moteurs ne touchent pas au DOM et n'importent pas l'interface. La 1.8.0 garde ce découpage (événement `connected`).
- Une seule logique de presets pour les deux popups, pure et testée.
- La CI bloque le déploiement sur le typecheck (avertissements Svelte compris) et les tests.
- Ce que le piano accepte réellement est documenté dans `docs/fp30x-midi.md`, essais à l'appui.
- `docs/bugs.md` et les commentaires sont précis : diagnostic, scénario, décision de l'utilisateur.
