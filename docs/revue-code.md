# Revue de code — version 1.7.2

Revue du 2026-10-14, sur le commit `6a40f84` (`main`).

**Périmètre** : tout `src/` (moteurs, interface, Service Worker, configuration), `vite.config.ts`, `index.html`, `public/manifest.json`, le workflow de déploiement. Les styles n'ont été regardés que de loin, et `tools/regression/` n'a pas été relu.

**Méthode** : lecture du code. `npm run typecheck` (0 erreur, 0 avertissement) et `npm test` (50 tests, tous verts) passent. Le défaut du parseur BLE (n° 1 ci-dessous) a été confirmé en le faisant tourner sur deux paquets construits à la main. Le reste vient de la lecture et n'a pas été testé sur la tablette : ce qui demande une vérification sur l'appareil est marqué **à vérifier**.

Les bugs confirmés sont aussi inscrits dans `docs/bugs.md` (n° 8 à 12), comme le demande la règle du projet. Rien n'a été corrigé.

---

## Synthèse

Le code est en bon état. Les moteurs ne touchent pas au DOM, l'interface suit leurs événements, la logique des presets est pure et testée, et la CI bloque tout déploiement qui ne passe pas le typecheck et les tests. Les bugs n° 1 à 7 sont bien documentés et leurs correctifs sont propres.

Les risques les plus sérieux pour un spectacle concernent **le MIDI en Bluetooth** : un parseur qui peut mal décoder ce qu'envoie le piano, et une file d'écritures GATT que l'application peut engorger elle-même. Côté audio, il reste quelques courses à la marge, sans gravité.

| # | Constat | Gravité | Certitude |
|---|---------|---------|-----------|
| 1 | Parseur BLE : les messages de 1 ou 2 octets décalent la lecture du paquet | Moyenne | Confirmé par essai ; impact réel **à vérifier** |
| 2 | Animation des effets piano : les 7 CC sont renvoyés à chaque frame, même inchangés | Moyenne | Code ; latence BLE **à mesurer** |
| 3 | Arrêt d'urgence MIDI : 32 écritures BLE, mises derrière la file en attente | Moyenne | Code |
| 4 | Débranchement / branchement USB non suivis | Moyenne | Code ; comportement de Chrome **à vérifier** |
| 5 | Reprise après pause puis Stop rapide : `TypeError` | Faible | Code |
| 6 | Volume déplacé pendant un fondu d'entrée : ignoré | Faible | Code |
| 7 | Volume appliqué deux fois (élément `<audio>` et gain master) | Faible | **À vérifier** |
| 8 | `MediaElementTrack.load()` rend la main avant la fin du chargement | Faible | Code |
| 9 | Statut Wake Lock « actif » affiché après sa libération | Faible | Code |
| 10 | Pas de reconnexion BLE automatique après une coupure | Amélioration | — |
| 11 | Polices Google chargées depuis le réseau | Amélioration | — |
| 12 | Code mort et nœuds audio inutilisés | Dette | — |

---

## Constats détaillés

### 1. Parseur BLE MIDI : les messages de 1 ou 2 octets décalent la lecture

- **Où** : `src/midi/ble-midi-parser.ts:113` (`parseFullMidiMessage`) et `:122` (`parseRunningStatusMidiMessage`), utilisé par la boucle de retour (loopback) de `src/midi/bluetoothMIDI.ts:144`
- **Diagnostic** : le parseur lit toujours **deux** octets de données après un octet de statut. C'est faux pour Program Change (`0xC0`) et Channel Pressure (`0xD0`), qui n'en ont qu'un, et pour les messages temps réel d'un seul octet comme Active Sensing (`0xFE`). Dans un paquet qui contient un autre message après ceux-là, l'octet d'horodatage suivant est pris pour une donnée, et tout le reste du paquet est mal décodé. Le défaut vient du paquet `ble-midi` d'origine, recopié tel quel.
- **Essai** (sortie réelle de `parsePacket`) :
  - `[80 80 C0 05 80 90 3C 64]` (Program Change 6, puis Note On do4) donne `C0 05 80`, puis `C0 3C 64`. Le loopback renvoie au piano `C0 05` puis **`C0 3C`** : le piano passe sur le programme 61, et la note est perdue.
  - `[80 80 FE 80 80 3C 00]` (Active Sensing, puis Note Off do4 en running status) donne `FE 80 80`, puis `FE 3C 00` : le Note Off est perdu, et la **note peut rester bloquée** si le loopback est ce qui la fait sonner.
- **À vérifier** : savoir si le FP-30X envoie en BLE des Program Change (changement de son sur le piano) ou de l'Active Sensing **dans le même paquet** qu'autre chose. Le log `MIDI IN (BT)` existe déjà : jouer, changer de son sur le piano, et regarder les paquets.
- **Piste** : donner à chaque statut sa longueur de données (`C0`/`D0` : 1 octet ; `F8`–`FF` : 0 ; `F1`/`F3` : 1 ; `F2` : 2 ; sinon 2), dans `parseFullMidiMessage` et dans le running status. Ajouter les deux paquets ci-dessus aux tests de `ble-midi-parser.test.ts`.

### 2. Animation des effets piano : tous les CC renvoyés à chaque frame

- **Où** : `src/ui/fx-overlay.svelte.ts:302` (`animateToValues`, rappel `onFrame`), puis `applyMidiFxValue` (`src/fx/midi-fx.ts:121`)
- **Diagnostic** : pendant une animation (preset, Reset, ↺ d'un curseur), chaque frame appelle `setControlValue(…, apply = true)` pour **chacun** des 7 contrôles, que sa valeur ait changé ou non. Chaque appel envoie un CC. Une animation de 320 ms à 60 images/s envoie donc environ 20 × 7 = 140 messages. Le bouton Reset en envoie autant même quand tout est déjà au neutre (l'animation tourne quand même), et il anime les deux popups.
- **Conséquence** : en USB, c'est sans effet notable. En BLE, chaque message est une écriture GATT, faite l'une après l'autre (`#writeQueue`, `bluetoothMIDI.ts:62`) et affichée dans la console. Si la liaison absorbe moins de messages par seconde que l'animation n'en produit, la file grossit, et **un changement d'instrument ou un arrêt d'urgence appuyé juste après attend que la file se vide**. Ce retard n'a pas été mesuré.
- **Piste**, sans changer ce que reçoit le piano :
  - dans `applyMidiFxValue`, n'envoyer que si la valeur arrondie diffère de `MIDI_FX_STATE[control.key]` ;
  - ou, dans `onFrame`, n'appliquer que les contrôles dont la valeur a changé depuis la frame précédente ;
  - ne pas lancer d'animation quand les cibles sont déjà atteintes (`fxTargetsMatchCurrent`).
- **À mesurer** sur la tablette en BLE : la durée entre un appui sur Reset suivi d'un changement d'instrument et l'arrivée du Program Change.

### 3. Arrêt d'urgence MIDI : 32 écritures, derrière la file

- **Où** : `src/midi/midi.ts:50` (`sendEmergencyStopMidi`)
- **Diagnostic** : l'arrêt envoie All Notes Off (CC123) et Reset All Controllers (CC121) sur les 16 canaux, soit 32 messages. En BLE, ce sont 32 écritures GATT, ajoutées **à la fin** de la file : si une animation d'effets vient de la remplir (n° 2), l'arrêt passe après.
- **Piste** :
  - commencer par le canal utilisé (`STATE.MIDI_CHANNEL`), ou s'y limiter : l'application n'émet que sur ce canal ;
  - ajouter All Sound Off (CC120), qui coupe aussi les queues de réverbération ;
  - en BLE, vider la file en attente avant l'arrêt (un compteur de génération suffit à ignorer les écritures périmées), ou regrouper plusieurs messages dans un même paquet (le format BLE MIDI le permet, un octet d'horodatage par message, dans la limite de la taille d'un paquet).

### 4. Débranchement et branchement USB non suivis

- **Où** : `src/midi/connection.ts:81` (`onstatechange`) et `:89` (`autoConnectUsbPiano`)
- **Diagnostic** :
  - quand le câble est débranché, `onstatechange` ne fait que reconstruire la liste. `STATE.midiOutput` garde le port, et le badge reste « ● USB ». Selon Chrome, `send()` sur un port déconnecté échoue ou ne fait rien, en silence ou avec une exception non rattrapée dans le gestionnaire de clic ;
  - si l'application démarre **sans** le piano et qu'on le branche ensuite, l'auto-connexion ne se fait pas : elle n'est tentée qu'au premier accès Web MIDI. Il faut choisir le piano à la main dans la liste.
- **À vérifier** sur la tablette : débrancher puis rebrancher le câble en plein usage, et regarder le badge, l'effet des boutons d'instruments et la console. Chrome réutilise normalement le même objet port au rebranchement, ce qui rétablirait l'envoi tout seul, mais l'interface, elle, ne le montre pas.
- **Piste** : dans `onstatechange`, si la sortie courante passe à `state === 'disconnected'`, mettre `currentConnectionType` à `null` (badge « Non connecté ») ; si aucune connexion n'est active et qu'une sortie « piano » apparaît, appeler `autoConnectUsbPiano()`.

### 5. Reprise après pause, puis Stop rapide : `TypeError`

- **Où** : `src/audio/playback.ts:225` (`togglePlayPause`), callback `.then()` de la ligne 231
- **Scénario** : un son en pause ; on appuie sur ▶, puis sur STOP (ou sur un autre son) avant que `play()` ne soit résolu (quelques dizaines de millisecondes).
- **Diagnostic** : le callback relit `STATE.currentAudio!` et `STATE.currentSoundItem!` sans vérifier qu'ils sont encore là. Après un Stop, ils valent `null` : `getPlaybackRange(null)` lève une `TypeError`. Si un autre son a été lancé entre-temps, le callback lui applique un fondu d'entrée de 150 ms et un événement `resume` qui ne le concernent pas. Il n'y a pas de `.catch()` non plus : un échec de `play()` donne une promesse rejetée non gérée.
- **Conséquence** : une erreur dans la console, sans effet visible dans le premier cas ; un petit creux de volume possible dans le second.
- **Piste** : garder la piste et le son dans des variables avant `play()`, puis vérifier `STATE.currentAudio === audio` dans le `.then()` (comme le fait `playSound`), et ajouter un `.catch()`.

### 6. Volume déplacé pendant un fondu d'entrée : ignoré

- **Où** : `src/audio/playback.ts:56` (`fadeAudio`) et `:263` (`setAudioVolume`)
- **Scénario** : on lance un son et on baisse aussitôt le volume (« trop fort ! »), pendant les 300 ms du fondu d'entrée (ou les 150 ms d'une reprise).
- **Diagnostic** : `setAudioVolume` applique la nouvelle valeur, mais le fondu en cours l'écrase à la frame suivante et termine sur la cible qu'il avait au départ (`to`, figé au lancement du fondu).
- **Conséquence** : le curseur affiche la nouvelle valeur, alors que le son reste à l'ancienne jusqu'au prochain mouvement du curseur.
- **Piste** : dans `setAudioVolume`, annuler le fondu d'entrée en cours (pas un fondu de sortie, qui doit aller au bout), ou faire lire la cible `STATE.audioVolume` à chaque pas du fondu d'entrée.

### 7. Volume appliqué deux fois (à vérifier)

- **Où** : `src/audio/audio-engine.ts:519` (setter `volume` de `MediaElementTrack`) et `:250` (`setMasterVolume`)
- **Diagnostic** : le volume est écrit à la fois sur le gain master du graphe Web Audio **et** sur `audio.volume` de l'élément. Si Chrome applique `audio.volume` au signal qui entre dans le `MediaElementAudioSourceNode` (c'est à vérifier, les navigateurs ne se comportent pas tous pareil), le gain effectif est v² : à 50 % sur le curseur, on entend −12 dB au lieu de −6 dB, et les fondus suivent aussi une courbe au carré.
- **Conséquence** : rien de cassé, le comportement est le même qu'en v1 et le réglage s'est fait à l'oreille. Mais le code ne dit pas si c'est voulu.
- **À vérifier** : comparer le niveau d'un son à 50 % avec `audio.volume = 1` forcé.
- **Piste** : si c'est confirmé, choisir une seule commande (le gain master) et, si la courbe au carré plaît, l'écrire explicitement. Comme cela change le rendu, c'est à décider.

### 8. `MediaElementTrack.load()` rend la main avant la fin du chargement

- **Où** : `src/audio/audio-engine.ts:537` à `:578`
- **Diagnostic** : `load()` crée la promesse de chargement mais renvoie `this` (ligne 578), pas la promesse. Dans `playSound` (`playback.ts:198`), `await audio.load()` ne fait donc rien attendre, et la vérification de `_playRequestId` qui suit ne sert à rien. Le vrai chargement est attendu plus tard, dans `play()`, qui rappelle `load()` et récupère alors `_loadPromise`. Si le fichier échoue **avant** ce second appel, la promesse est rejetée sans que personne ne l'attende (« Uncaught (in promise) » dans la console), puis `play()` relance un chargement complet du fichier.
- **Conséquence** : pas de bug visible ; une erreur parasite dans la console et une requête en double pour un fichier manquant. Le code ne fait pas ce qu'il annonce.
- **Piste** : `return this._loadPromise;`. Vérifier ensuite que le scénario de `tools/regression` ne bouge pas.

### 9. Statut Wake Lock « actif » après sa libération

- **Où** : `src/wake-lock.ts:10`, lu par `src/ui/components/AboutPopup.svelte:23`
- **Diagnostic** : le navigateur libère le verrou quand la page passe en arrière-plan (et parfois en mode économie d'énergie). `STATE.wakeLock` garde alors l'objet libéré : si la nouvelle demande échoue au retour, la popup À propos affiche toujours « Wake Lock : actif ✓ ».
- **Piste** : tester `STATE.wakeLock && !STATE.wakeLock.released`, ou remettre `STATE.wakeLock` à `null` sur l'événement `release`.

---

## Améliorations pour la scène

### 10. Reconnexion BLE automatique

Après une coupure (piano éteint, interférence), `gattserverdisconnected` repasse au statut `idle`, et il faut tout refaire à la main : choisir Bluetooth, puis passer par le sélecteur d'appareil. Or `device.gatt.connect()` sur un appareil **déjà choisi** ne demande pas de geste de l'utilisateur. Une reconnexion automatique (quelques essais espacés, sur le `device` gardé en mémoire) éviterait ce passage par le sélecteur en plein spectacle. Aujourd'hui, `#cleanup()` oublie l'appareil (`#device = null`) : il faudrait le garder.

Au passage, après une reconnexion (USB ou BLE), seul le volume est renvoyé au piano, pas `MIDI_FX_STATE`. Si le piano a redémarré, la popup affiche des effets qu'il n'applique plus. Renvoyer l'état des CC à la connexion alignerait les deux.

### 11. Polices hébergées par Google

`index.html` charge Rajdhani et IBM Plex Mono depuis `fonts.googleapis.com`. Au tout premier lancement, le Service Worker ne contrôle pas encore la page, donc les polices ne sont mises en cache qu'au lancement suivant. Héberger les deux polices dans `public/` (ou les importer en CSS) les ferait entrer dans le precache : plus de dépendance au réseau, ni à Google, même au premier lancement hors ligne.

### Divers

- La boucle de retour USB (`connection.ts:156`) renvoie au piano **tout** ce qu'il émet, Active Sensing compris. Le README et le code ne disent pas pourquoi ce loopback existe (Local Control désactivé ?) : une ligne de commentaire éviterait qu'on le retire un jour par erreur.
- La fin d'un son avec `end` est détectée dans la boucle `requestAnimationFrame`. Si la page passe en arrière-plan, la boucle s'arrête et le son dépasse sa fin. Le Wake Lock rend le cas rare.
- Le curseur de volume MIDI envoie un CC7 à chaque événement `input`. C'est correct, mais cela charge aussi la file BLE (voir n° 2).

---

## Simplifications et dette

### 12. Code mort et nœuds audio inutilisés

- **Distorsion et compresseur** : ils sont dans le graphe (`audio-engine.ts:113` et `:115`), mais aucun contrôle de l'interface ne les règle. Le `WaveShaperNode` (suréchantillonnage ×4) et le compresseur (ratio 1) traitent le signal en permanence pour rien. Même chose pour la réverbération : la convolution sur une réponse impulsionnelle de 4,8 s en stéréo tourne même quand le mix est à 0. Sur une tablette Android, c'est du CPU qui pourrait manquer et provoquer des craquements. Pistes : retirer distorsion et compresseur, et ne connecter la réverbération et le delay que quand leur mix est supérieur à 0.
- **`AudioEngineAPI`** expose des fonctions que personne n'appelle : `init`, `load`, `resetSettings`, `restoreEffectSettings`, `getDefaultSettings`, `setEQ`, `setCompressor`, `setDistortionAmount`. À retirer avec ce qui ne sert qu'à elles.
- **Branches mortes** : `canUseMediaElementSource` (`audio-engine.ts:93`, seulement faux en `file:`, où l'application ne peut de toute façon pas tourner : modules ES, Service Worker) et le repli `webkitAudioContext` (`:101`, la cible est Chrome).
- `applyAudioFxValue` se contente d'appeler `control.apply` ; `MIDI_CHANNEL` est le seul champ en majuscules de `AppState`.
- Les attributs `data-*` différents entre les popups MIDI et audio (`FxOverlayAttributes`) ne servent qu'aux sélecteurs de `tools/regression`. On peut les garder tant que l'outil compare avec la v1.
- `EmergencyStopButton` fabrique un identifiant avec `Math.random()` pour ses motifs SVG ; Svelte 5 fournit `$props.id()` pour ça.

---

## Tests

Les fonctions pures (presets, timing, octets MIDI, parseur, identifiants de configuration) et la lecture (`playback.test.ts`) sont couvertes. Ce qui manque, par ordre d'utilité :

1. le parseur BLE sur des paquets à plusieurs messages, dont des messages de 1 et 2 octets (n° 1) ;
2. le nombre de messages MIDI envoyés par une animation de preset ou un Reset (n° 2), avec un `sendMidi` simulé ;
3. `togglePlayPause` suivi d'un `stopSound` avant la résolution de `play()` (n° 5), avec les fausses pistes déjà en place dans `playback.test.ts` ;
4. `selectMidiConnection` (bascule USB / BLE, annulation du sélecteur), avec de faux `MIDIAccess` et `BluetoothMIDI`.

---

## Points positifs

- Le découpage moteurs / interface est respecté partout : aucun import de `src/ui/` depuis `src/midi/`, `src/audio/` ou `src/fx/`.
- Une seule logique de presets pour les deux popups, pure, paramétrée par les contrôles et bien testée, y compris sur les presets réels de la configuration.
- Le Service Worker règle proprement le cas des requêtes `Range` (bug n° 4), et le commentaire explique pourquoi.
- `playSound` résiste aux clics rapides (`_playRequestId`), et toutes les sorties de piste passent par `dispose()`.
- La CI bloque le déploiement sur le typecheck (avertissements Svelte compris) et les tests.
- `docs/bugs.md` et les commentaires sont précis : diagnostic, scénario, décision de l'utilisateur.
