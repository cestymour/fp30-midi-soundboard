# Revue de code : version 1.7.3

Revue du 2026-11-05, sur le commit `43ac2c3` (`main`). Elle complète celle de la 1.7.2 (`docs/revue-code.md`) : ce qui y figure déjà n'est pas répété ici, seulement son statut.

**Périmètre** : tout `src/` (moteurs, interface, Service Worker, configuration), `vite.config.ts`, `index.html`, `public/manifest.json`, le workflow de déploiement, `tools/regression/` (non relu en 1.7.2), `global.css`, les dépendances.

**Méthode** : lecture du code. `npm run typecheck` (0 erreur, 0 avertissement), `npm test` (56 tests, tous verts) et `npm run build` passent ; `npm audit` ne signale aucune vulnérabilité. Rien n'a été testé sur la tablette : ce qui demande l'appareil est marqué **à vérifier**. Rien n'a été corrigé ; les bugs sont inscrits dans `docs/bugs.md` (n° 13 et 14, et des pistes nouvelles pour le n° 8).

---

## Synthèse

Le code reste propre et cohérent. Depuis la 1.7.2, seul le parseur BLE a changé (bug n° 8), et son correctif est juste. Mais le symptôme persiste, et la lecture du chemin de **renvoi** des notes au piano (loopback) donne des causes plus probables que le parseur.

Les autres constats nouveaux concernent surtout ce qui peut trahir **pendant un spectacle** : l'état affiché qui ne correspond plus au piano après une reconnexion, et la fiabilité du hors ligne (sons remplacés, cache non persistant).

| # | Constat | Gravité | Certitude |
|---|---------|---------|-----------|
| 1 | Notes tenues en BLE (bug n° 8) : le renvoi au piano fait une écriture GATT par message, et une écriture échouée est perdue | Haute | Code ; cause **à vérifier** |
| 2 | Instrument et effets non renvoyés au piano à la connexion ou à la reconnexion | Moyenne | Code |
| 3 | Un son remplacé sous le même nom n'est jamais mis à jour sur la tablette | Moyenne | Code |
| 4 | Cache des sons non persistant, préchargement à la main | Amélioration | — |
| 5 | Pas de limiteur en sortie du moteur audio : saturation possible avec les effets | Faible | **À vérifier** à l'oreille |
| 6 | Une piste libérée ne libère pas son élément `<audio>` | Faible | **À vérifier** |
| 7 | Parseur BLE : un SysEx n'annule pas le running status | Très faible | Code |
| 8 | `#app` en `100vh` : bas de l'écran coupé dans un onglet Chrome | Faible | Code |
| 9 | Curseurs de volume : un appui saute directement à la position touchée | Amélioration | — |
| 10 | Code mort : correctif du passe-bas au-dessus de 20 kHz | Dette | — |

---

## Constats détaillés

### 1. Notes tenues en BLE : le chemin d'écriture du loopback

- **Où** : `src/midi/bluetoothMIDI.ts:59` (`send`) et `:147` (loopback dans le gestionnaire de notifications)
- **Contexte** : en Bluetooth comme en USB, chaque message que le piano envoie est renvoyé au piano. Ce sont donc ces renvois qui font sonner les touches (Local Control désactivé, à confirmer, voir « Divers » de la revue 1.7.2). Un Note Off perdu **à l'aller ou au retour** laisse la note tenue.
- **Diagnostic** :
  1. **Une écriture par message.** Le paquet reçu est décodé, puis chaque message est réencodé dans son propre paquet `[80 80 …]`. Relâcher un accord de 8 notes, c'est 8 écritures GATT, faites l'une après l'autre. Chacune peut échouer indépendamment, et la dernière note part 8 intervalles de connexion plus tard.
  2. **Une écriture échouée est perdue.** En cas d'échec, `send()` se replie sur `writeValueWithResponse`. Or la norme BLE MIDI n'impose que l'écriture *sans* réponse. Si la caractéristique du FP-30X ne déclare pas `write`, le repli échoue aussi (`NotSupportedError`), et le message disparaît avec un simple `MIDI OUT (BT) échoué` dans la console. Rien ne réessaie.
  3. **Hypothèse, non vérifiée** : sur Android avant la version 13, l'ancienne API Bluetooth partage un même tampon de valeur par caractéristique, entre les notifications reçues et les écritures envoyées. Une écriture faite en même temps qu'une notification peut abîmer l'une ou l'autre. Je n'ai pas pu vérifier si Chrome utilise encore cette API. Or, ici, l'application écrit justement sur la caractéristique qui lui envoie les notifications, et au même rythme.
- **À vérifier** sur la tablette, dans la console Chrome (débogage à distance) :
  - ce que la caractéristique accepte : la classe ne l'expose pas, il faut un log temporaire de `characteristic.properties` (`write`, `writeWithoutResponse`) à la connexion ;
  - après un accord tenu qui reste bloqué, chercher `MIDI OUT (BT) échoué` et `fallback writeValueWithResponse` ;
  - compter les Note On et Note Off reçus et ceux dont l'écriture a réussi. S'ils sont égaux et que la note reste tenue, le problème est côté piano ou côté liaison radio, pas dans l'application ;
  - noter la version d'Android de la tablette (point 3).
- **Pistes**, de la plus simple à la plus lourde :
  - **renvoyer le paquet reçu tel quel** (une écriture par notification, mêmes octets). Il est déjà à la bonne taille, puisque c'est le piano qui l'a envoyé, et il garde son running status et ses horodatages. Le parseur ne sert alors plus au loopback, seulement à l'affichage et au log. C'est ce que fait déjà le loopback USB (`midiOutput.send(event.data)`) ;
  - en cas d'échec, **réessayer la même écriture** sans réponse (deux ou trois fois, à quelques millisecondes d'intervalle) au lieu du repli avec réponse ;
  - à défaut, regrouper plusieurs messages en attente dans un même paquet (un octet d'horodatage par message, dans la limite de la MTU).

### 2. État du piano non renvoyé à la (re)connexion

- **Où** : `src/midi/connection.ts:55` (BLE connecté) et `:163` (USB choisi) ; `src/ui/midi-ui.svelte.ts:25` (`selectInstrument`)
- **Scénarios** :
  - en Bluetooth, la liaison tombe (piano éteint et rallumé, interférence) et on se reconnecte. Seul le volume (CC7) est renvoyé. Le piano revient sur son son par défaut, alors que l'interface surligne encore l'instrument choisi avant la coupure et affiche les effets d'avant ;
  - on appuie sur un instrument **avant** d'être connecté. Il est surligné, mais rien n'est envoyé (`Pas de connexion MIDI active` dans la console). Après la connexion, l'interface affiche cet instrument, alors que le piano joue autre chose.
- **Conséquence** : en spectacle, le musicien croit jouer de l'orgue et entend un piano, jusqu'à ce qu'il réappuie sur le bouton.
- **Piste** : à chaque passage à l'état connecté (USB ou BLE), renvoyer l'instrument actif (`instruments.active`), le volume, et les CC de `MIDI_FX_STATE` (au moins ceux qui ne sont pas au neutre). Les moteurs ne doivent pas importer l'interface : c'est `bindMidiConnectionUI()` qui s'en charge, sur l'événement `status`. Variante plus simple : ne surligner un instrument que s'il a vraiment été envoyé.

### 3. Son remplacé sous le même nom : jamais mis à jour

- **Où** : `src/sw.ts:56` (route `/sounds/`, `CacheFirst` dans `impro-audio`, sans révision ni expiration) ; même chose pour `/images/`
- **Scénario** : on remplace `sounds/films/(Saw) Theme.mp3` par une meilleure version sous le même nom, et on ajuste son `start` dans la configuration. On publie.
- **Diagnostic** : l'application et sa configuration sont mises à jour, mais le Service Worker sert toujours l'ancien fichier depuis `impro-audio`, sans jamais interroger le réseau. Le bouton « Vider le cache et recharger » ne vide pas ce cache (bug n° 7).
- **Conséquence** : sur la tablette, le nouveau `start` s'applique à l'ancien fichier. Le son démarre au mauvais endroit, sans aucun message d'erreur. Seul l'effacement des données du site dans Chrome rétablit le bon fichier, ce qui efface aussi tous les autres sons du cache.
- **Piste** : la plus simple est une règle de travail, à écrire dans le README : un fichier modifié change de nom. Plus robuste : versionner l'URL des sons dans la configuration (`?v=2`), ou donner au cache audio un nom qui change quand la liste des fichiers change, puis nettoyer les anciens caches. Cela ne retélécharge alors que ce qui a changé, à condition de copier les entrées inchangées d'un cache à l'autre.

### 4. Hors ligne : cache non persistant, préchargement à la main

- **Constat** : `navigator.storage.persist()` n'est appelé nulle part. Sans stockage persistant, Chrome peut effacer les caches du site (104 Mo de sons, 74 fichiers) s'il manque de place. Par ailleurs, la mise en cache dépend de la consigne « jouer chaque son une fois avant le spectacle » : un son oublié n'est pas disponible hors ligne.
- **Pistes** :
  - appeler `navigator.storage.persist()` au démarrage, et afficher le résultat dans la popup À propos. Chrome l'accorde en général sans demander pour une PWA installée ;
  - ajouter dans la popup À propos un bouton « Télécharger tous les sons pour le hors ligne », qui parcourt `getAudioTabs()` et demande chaque fichier (le Service Worker les met en cache), avec un compteur « 74 / 74 sons disponibles hors ligne ». Ce compteur sert aussi de vérification avant le spectacle.

### 5. Pas de limiteur en sortie (à vérifier à l'oreille)

- **Où** : `src/audio/audio-engine.ts:165` (`masterGain → destination`), `:222` (gain de réverbération jusqu'à 1,38), `:244` (delay)
- **Diagnostic** : le signal sec reste à 1, et la réverbération (jusqu'à ×1,38), le delay et les boosts d'égaliseur (jusqu'à +15 dB) s'y ajoutent, sans rien qui limite la sortie. Le compresseur du graphe est placé **avant** les effets, avec un ratio de 1 (inactif). Au-delà de 0 dBFS, le signal sature (craquements), ce que le commentaire de `getReverbWetGain` cherche déjà à limiter.
- **À vérifier** : un son déjà fort, avec le volume à 100 %, la réverbération à 100 % et les basses à +15 dB.
- **Piste** : un `DynamicsCompressorNode` réglé en limiteur (seuil vers −1 dB, ratio 20, attaque courte) entre `masterGain` et la sortie. Cela peut remplacer le compresseur inutilisé, sans changer le rendu à volume normal.

### 6. Une piste libérée ne libère pas son élément `<audio>` (à vérifier)

- **Où** : `src/audio/audio-engine.ts:607` (`dispose`)
- **Diagnostic** : `dispose()` met l'élément en pause et le déconnecte du graphe, mais ne vide pas sa source. Chaque son joué laisse un élément `<audio>` (avec son décodeur et sa mémoire tampon) jusqu'au passage du ramasse-miettes. Chrome sur Android limite le nombre de lecteurs média simultanés par page.
- **À vérifier** : jouer une centaine de sons d'affilée sur la tablette, puis regarder la mémoire (`chrome://inspect`) et si un son finit par refuser de démarrer.
- **Piste** : à la fin de `dispose()`, `this.audio.removeAttribute('src'); this.audio.load();`.

### 7. Parseur BLE : un SysEx n'annule pas le running status

- **Où** : `src/midi/ble-midi-parser.ts:169` (`parseSysex`)
- **Diagnostic** : en MIDI, un message SysEx annule le running status, comme les autres messages système communs (ce que fait déjà `parseFullMidiMessage`). `parseSysex` le laisse en place. Sans effet en pratique : le piano n'envoie pas de SysEx pendant le jeu. Une ligne suffit (`info.runningStatus = -1`), avec un test.

### 8. `#app` en `100vh`

- **Où** : `src/css/global.css:55`
- **Diagnostic** : dans un onglet Chrome sur Android, `100vh` compte aussi la hauteur de la barre d'adresse : le bas de l'interface (dernière rangée de boutons) passe sous l'écran. En mode installé (PWA, plein écran), le problème ne se pose pas.
- **Piste** : `height: 100dvh` (avec `100vh` avant, en repli). C'est un changement CSS, à vérifier avec `tools/regression/styles.sh`.

### 9. Curseurs de volume : saut à la position touchée

Un `<input type="range">` saute à l'endroit touché. Un effleurement accidentel du curseur audio, en plein spectacle, peut faire passer le volume de 30 % à 100 %. Une piste serait de ne réagir qu'à un glissement qui part de la poignée, mais cela change le geste. C'est à décider, pas urgent.

### 10. Code mort

- `afterSync` de la popup audio (`src/ui/fx-overlays.svelte.ts:60`) ramène un passe-bas supérieur à 20 kHz. Ce cas ne peut plus arriver : la valeur par défaut est 20 kHz, `setLowPassFrequency` borne à 20 kHz, et rien n'est relu depuis un stockage. On peut retirer ce code, ainsi que `afterSync` s'il ne sert à rien d'autre.
- S'y ajoute ce que relevait déjà la revue 1.7.2 (n° 12) : nœuds audio inutilisés, fonctions non appelées d'`AudioEngineAPI`.

---

## Suivi de la revue 1.7.2

| # 1.7.2 | Constat | Statut |
|---------|---------|--------|
| 1 | Parseur BLE | Corrigé en 1.7.3 ; le symptôme persiste, voir n° 1 ci-dessus |
| 2 | Animation des effets piano : 7 CC par frame | Ouvert (bug n° 9). Il pèse aussi sur le n° 1 : il remplit la même file d'écriture BLE |
| 3 | Arrêt d'urgence : 32 écritures BLE derrière la file | Ouvert |
| 4 | Débranchement / branchement USB non suivis | Ouvert ; à traiter avec le n° 2 ci-dessus (même endroit) |
| 5 | Reprise après pause puis Stop rapide | Ouvert (bug n° 10) |
| 6 | Volume ignoré pendant un fondu d'entrée | Ouvert (bug n° 11) |
| 7 | Volume appliqué deux fois | Ouvert, à vérifier |
| 8 | `load()` rend la main trop tôt | Ouvert |
| 9 | Statut Wake Lock | Ouvert (bug n° 12) |
| 10 | Reconnexion BLE automatique | Ouvert ; le n° 2 ci-dessus en est le complément |
| 11 | Polices Google | Ouvert |
| 12 | Code mort | Ouvert |

---

## Outils, build, dépendances

- `tools/regression/` : rien à signaler. La référence par défaut est le dernier tag ; tant que `v1.7.3` n'est pas posé (bug n° 8), c'est `v1.7.2`, ce qui est voulu.
- Dépendances : aucune vulnérabilité. Des versions majeures existent (Vite 8, TypeScript 7, `vite-plugin-svelte` 7) ; rien ne presse, mais une montée de version se fait plutôt entre deux saisons de spectacles.
- Le precache fait 858 Ko (8 fichiers) ; sons et images n'y sont pas, comme prévu.

## Tests à ajouter

1. Loopback BLE : avec une fausse caractéristique, vérifier qu'un paquet reçu donne une seule écriture, et qu'une écriture qui échoue est réessayée (n° 1).
2. Reconnexion : avec de faux `MIDIAccess` et `BluetoothMIDI`, vérifier ce qui est renvoyé au piano au passage à l'état connecté (n° 2).
3. `parseSysex` suivi de données sans statut (n° 7).
