# Bugs

Journal des bugs repérés, avec leur diagnostic. Un bug trouvé en chemin est d'abord noté ici ; l'utilisateur décide ensuite s'il faut le corriger, et quand. Les n° 1 à 6 ont été trouvés pendant la refonte (voir `docs/refonte.md`), qui ne devait changer aucun comportement : ils ont été notés sans être corrigés, puis corrigés après la fusion dans `main` (version 1.7.1). Les « Où » donnent l'emplacement dans la v1 (tag `v1-vanilla`) et dans le code de la refonte, avant le correctif.

Statuts : **ouvert**, **corrigé** (correctif ciblé, daté), **corrigé par la refonte** (le nouveau code se comporte autrement par construction, sans correctif ciblé).

**Décision de l'utilisateur (2026-10-13, phase 6)** : corriger les n° 1, 2, 3, 5 et 6, **après** la fusion de la refonte dans `main`, un commit par bug. Le n° 5 est bien un bug (pas un repère « déjà joué » à garder). Fait le 2026-10-14 (version 1.7.1).

---

## 1. Changement de son direct : pas de fondu de sortie, ancienne piste jamais libérée

- **Statut** : corrigé (2026-10-14) : `cancelFade()` libère (`dispose()`) la piste dont le fondu de sortie est interrompu. Le changement de son reste sans fondu croisé : l'ancien son est coupé net, **voulu** (décision de l'utilisateur, 2026-10-14 : un fondu de sortie retarderait le son suivant, qui doit partir tout de suite)
- **Constaté** : phase 1 (2026-10-13), à la lecture du code
- **Où** : v1 : `js/audio.js` (`stopSound()`, `playSound()`), clic dans `js/app.js` (`buildSoundBtn`) ; refonte : `src/audio/playback.ts` (`stopSound()`, `playSound()`, `cancelFade()`), clic dans `src/ui/components/SoundButton.svelte`
- **Scénario** : un son joue, on clique sur un **autre** bouton son.
- **Diagnostic** :
  1. Le clic appelle `stopSound(true)` puis `playSound(btn)` immédiatement.
  2. `stopSound(true)` lance un fondu de 400 ms sur l'ancienne piste (`fadeAudio`, qui mémorise la piste dans `_fadingAudio`), dont le callback de fin doit appeler `dispose()`.
  3. `playSound()` commence par `cancelFade()` : le timer du fondu est arrêté et l'ancienne piste est mise en pause et remise à 0, mais `dispose()` n'est jamais appelé.
- **Conséquences** :
  - pas de fondu entre deux sons : l'ancien est coupé net ;
  - l'ancienne piste reste dans `AudioEngine.tracks`, avec son élément `<audio>` et ses nœuds Web Audio (`MediaElementSource`, `GainNode`) toujours connectés au graphe. Fuite lente au fil d'un spectacle ; `setMasterVolume()` et `setPlaybackRate()` continuent à parcourir ces pistes mortes.
- **Piste de correction** : dans `cancelFade()`, appeler `dispose()` sur `_fadingAudio` plutôt que `pause()` + `currentTime = 0`. Si un vrai fondu croisé est souhaité, c'est un changement de comportement à décider à part.

## 2. Timer de fondu global partagé entre deux fondus simultanés

- **Statut** : corrigé (2026-10-14) : `fadeAudio()` annule le fondu en cours avant d'en lancer un autre, et chaque intervalle s'arrête lui-même (timer local)
- **Constaté** : phase 3 (2026-10-13), à la lecture du code
- **Où** : v1 : `js/audio.js` ; refonte : `src/audio/playback.ts`, `fadeAudio()` (variables de module `_fadeTimer` et `_fadingAudio`)
- **Scénario** : un fondu démarre alors qu'un autre est en cours sans passer par `cancelFade()`, par exemple deux clics rapides sur pause (fondu de 150 ms) : `togglePlayPause()` n'appelle pas `cancelFade()`, et `STATE.isPaused` ne passe à `true` qu'à la fin du premier fondu.
- **Diagnostic** : le second `fadeAudio()` écrase `_fadeTimer` sans arrêter le premier intervalle. Quand le premier atteint sa cible, il fait `clearInterval(_fadeTimer)`, ce qui arrête **le second** fondu, et seul le callback du premier est appelé.
- **Conséquences** : volume ou état de pause incohérents dans des cas de clics très rapides. Pas observé en usage. Cas reproduit par test (`src/audio/playback.test.ts`) : une pause pendant le fondu d'entrée (300 ms après le lancement d'un son) n'aboutit jamais, le son continue à jouer et le fondu d'entrée remonte le volume.
- **Piste de correction** : chaque fondu garde son propre timer dans une variable locale, et `fadeAudio()` annule le fondu en cours avant d'en démarrer un nouveau.

## 3. L'auto-connexion USB au piano au chargement ne se fait pas

- **Statut** : corrigé (2026-10-14) : au premier accès Web MIDI, `autoConnectUsbPiano()` (`src/midi/connection.ts`) appelle `selectMidiConnection()` sur la première sortie dont le nom contient « piano » (le FP-30X se présente comme « Roland Digital Piano »), si aucune connexion n'est active. Toutes les listes affichent le piano et le badge passe à « ● USB »
- **Constaté** : phase 3 (2026-10-13), à la lecture du code ; correctif vérifié le 2026-10-14 dans Edge sous Windows, piano branché en USB avant le chargement
- **Où** : v1 : `js/midi.js`, `populateMidiSelects(true)`, et l'écouteur `change` délégué sur `#panels` dans `js/app.js` (`initMidiSelectDelegation`) ; refonte : `src/ui/midi-ui.svelte.ts`, `populateMidiSelects(true)`, qui reproduit le comportement (piano affiché dans la liste, sans connexion)
- **Diagnostic** : au premier chargement, si une sortie MIDI dont le nom contient « piano » existe, le code la sélectionne dans la liste puis fait `sel.dispatchEvent(new Event('change'))`. Cet événement est créé **sans `bubbles: true`** : il ne remonte pas jusqu'à `#panels`, où se trouve le seul écouteur. `handleMidiSelectChange()` n'est donc jamais appelé.
- **Symptôme attendu** : la liste affiche le piano mais le badge reste « Non connecté », et les boutons d'instruments n'ont aucun effet (« Pas de connexion MIDI active » dans la console) tant qu'on ne resélectionne pas le piano à la main.
- **Piste de correction** : `new Event('change', { bubbles: true })`. Le README annonce cette auto-connexion (« Auto-connects to the Roland FP-30X on page load »).

## 4. Ancien Service Worker : les sons ne sont pas mis en cache sur GitHub Pages

- **Statut** : corrigé par la refonte (phase 2) ; en production depuis la 1.7.0
- **Constaté** : phase 2 (2026-10-13), test en Chromium headless + `curl` sur la production
- **Où** : ancien `sw.js` (tag `v1-vanilla`), fonction `handleAudio()`
- **Diagnostic** : les éléments `<audio>` envoient des requêtes `Range` (`bytes=0-`), auxquelles GitHub Pages répond `206 Partial Content` (vérifié avec `curl -H "Range: bytes=0-"`). L'ancien SW fait `cache.put(request, response)` sur cette réponse 206, ce que l'API Cache refuse (promesse rejetée, non attendue, donc silencieuse). En test, le cache `impro-audio-1.6.4` reste vide après lecture de sons.
- **Conséquence** : en production actuelle, le hors ligne des sons ne repose que sur le cache HTTP du navigateur, sans garantie. La consigne « jouer chaque son une fois avant le spectacle » ne protège donc pas vraiment.
- **Dans la refonte** : le nouveau SW (`src/sw.ts`) télécharge le fichier entier sans en-tête `Range` au premier accès, le met en cache (200), puis sert les plages demandées depuis le cache (`RangeRequestsPlugin`). Vérifié hors ligne, seek compris.

## 5. La barre de progression d'un bouton de son reste affichée après l'arrêt

- **Statut** : corrigé (2026-10-14) : `bindPlaybackUI()` remet `progress` à `'0%'` sur l'événement `stop`, pour le son arrêté (la barre se vide avec la transition CSS)
- **Constaté** : phase 5 (2026-10-13), à la lecture du code, confirmé par le scénario de `tools/regression` sur `v1-vanilla`
- **Où** : v1 : `updateTransportUI()` (`js/app.js`) ; refonte : `SoundButtonState.progress` dans `src/ui/transport.svelte.ts`
- **Diagnostic** : la progression est dessinée par le pseudo-élément `.sound-btn::before`, de largeur `var(--progress)`, visible quel que soit l'état du bouton. À l'arrêt, le code prévu pour la remettre à zéro cherche `.sound-btn.playing, .sound-btn.paused`, mais `stopSound()` a déjà retiré ces classes : il ne trouve rien, et `--progress` garde sa dernière valeur (la classe `paused` n'est d'ailleurs jamais posée).
- **Conséquences** : chaque son joué puis arrêté garde un remplissage partiel (teinte d'accent à 25 %) jusqu'à sa prochaine lecture ; au relancement, la barre repart de cette position avec la transition CSS (0,05 à 0,3 s) au lieu de partir de zéro. Peut aussi être vu comme un repère « déjà joué », d'où la question : bug ou fonctionnalité ?
- **Piste de correction** : remettre `progress` à `'0%'` sur l'événement `stop` (pour le son arrêté).

## 6. Icône de volume : seul le panneau manipulé est mis à jour

- **Statut** : corrigé (2026-10-14) : dans `VolumeControl.svelte`, l'icône est dérivée de la valeur partagée (`$derived`), donc identique sur tous les panneaux du même type
- **Constaté** : phase 5 (2026-10-13), à la lecture du code, confirmé par le scénario de `tools/regression` sur `v1-vanilla` (volume MIDI à 20 : 🔈 sur le premier panneau, 🔊 sur le second)
- **Où** : v1 : `buildMidiControls()` / `buildAudioControls()` et `syncMidiSliders()` / `syncAudioSliders()` ; refonte : `src/ui/components/VolumeControl.svelte`
- **Diagnostic** : le volume (MIDI ou audio) est partagé entre tous les panneaux du même type : curseur, pourcentage et valeur sont synchronisés. Mais l'emoji (🔇 🔈 🔉 🔊) n'est recalculé que sur le panneau où l'on a bougé le curseur ; il vaut 🔊 au départ sur tous les panneaux.
- **Conséquences** : après avoir baissé le volume audio à 0 sur l'onglet Films, l'onglet Animaux affiche 🔊 avec un curseur à 0 %.
- **Piste de correction** : calculer l'emoji à partir de la valeur partagée (`STATE.midiVolume`, `STATE.audioVolume`) plutôt que dans un état local au panneau.

## 7. Bouton « Vider le cache et recharger » : il ne vide aucun cache

- **Statut** : ouvert
- **Constaté** : 2026-10-14, à la lecture du code (revue de la 1.7.2)
- **Où** : `src/ui/components/AboutPopup.svelte`, `reloadWithoutCache()` et le libellé de `#about-reload-btn`
- **Diagnostic** : le bouton désinscrit le Service Worker (`reg.unregister()`) puis recharge la page. Désinscrire un SW ne supprime pas ses caches : `impro-audio`, `impro-images`, les polices et le precache Workbox restent, de même que d'éventuels caches de la 1.6.x (`impro-app-*`, `impro-audio-*`, plus nettoyés depuis la 1.7.2). Garder `impro-audio` est souhaitable (pas de retéléchargement des sons, hors ligne préservé) ; c'est le libellé qui est trompeur.
- **Conséquences** : l'utilisateur croit repartir d'un cache vide alors que non. Ce que le bouton fait vraiment : recharger l'application depuis le réseau, sans passer par le SW, donc récupérer la dernière version publiée.
- **Piste de correction** : renommer le bouton selon ce qu'il fait, par exemple « ⟳ Mettre à jour et recharger » (et le commentaire d'en-tête du composant, « rechargement sans cache »). Ne pas ajouter de suppression des caches : on perdrait les sons hors ligne.

## 8. Parseur BLE MIDI : les messages de 1 ou 2 octets décalent la lecture du paquet

- **Statut** : corrigé (2026-10-14, version 1.7.3) : chaque statut a sa longueur de données (`getDataLength()`), une donnée n'est lue que si son bit 7 est à 0, le running status survit aux messages temps réel et passe d'un paquet au suivant (`parsePacket(packet, runningStatus)`, mémorisé dans `BluetoothMIDI`). Tests ajoutés dans `ble-midi-parser.test.ts`. **Le symptôme persiste en 1.7.3** (testé par l'utilisateur sur la tablette, 2026-10-14) : les défauts du parseur étaient réels, mais ce n'est pas la cause, ou pas la seule. Piste la plus probable : le Note Off arrive bien, mais son renvoi au piano se perd (une écriture GATT par message, abandonnée en cas d'échec, voir « Autre cause possible » plus bas). Diagnostic en cours : relevé des paquets BLE bruts reçus et envoyés sur la tablette. Tag `v1.7.3` en attente de la vraie correction
- **Constaté** : 2026-10-14, revue de code (`docs/revue-code.md`, n° 1), confirmé en faisant tourner `parsePacket` sur des paquets construits à la main. Le même jour, l'utilisateur rapporte le symptôme, **en Bluetooth uniquement** : avec un son tenu comme l'orgue, quand on joue beaucoup de notes à la fois, une ou plusieurs notes continuent de sonner après qu'on a relâché les touches (le relâchement n'est pas pris en compte)
- **Où** : `src/midi/ble-midi-parser.ts`, `parseFullMidiMessage()` et `parseRunningStatusMidiMessage()` ; conséquence dans le loopback de `src/midi/bluetoothMIDI.ts`
- **Diagnostic** : en Bluetooth, chaque note jouée sur le piano revient à l'application, qui la renvoie au piano (loopback) ; un Note Off mal décodé n'est donc jamais renvoyé, et la note renvoyée reste tenue. Trois défauts du parseur peuvent faire perdre un Note Off :
  1. il lit toujours deux octets de données après un statut. Program Change (`C0`) et Channel Pressure (`D0`) n'en ont qu'un, les messages temps réel (`F8`–`FF`, dont Active Sensing) aucun. Dans un paquet qui contient un message après ceux-là, l'octet d'horodatage suivant est pris pour une donnée et le reste du paquet est mal décodé. Défaut hérité du paquet `ble-midi` d'origine ;
  2. un message temps réel remplace le running status : les Note Off qui suivent sans statut prennent celui du message temps réel et sont écartés ;
  3. le running status repart de zéro à chaque paquet : si le relâchement d'un accord est découpé en plusieurs paquets et que le suivant commence sans statut, ses Note Off ont le statut -1 et sont écartés. C'est le scénario qui colle le mieux au symptôme (beaucoup de notes relâchées à la fois).
- **Scénarios** :
  - `[80 80 C0 05 80 90 3C 64]` (Program Change puis Note On) : le loopback renvoie `C0 3C` au piano, qui change de son, et la note est perdue ;
  - `[80 80 FE 80 80 3C 00]` (Active Sensing puis Note Off en running status) : le Note Off est perdu, et la note reste bloquée ;
  - `[80 80 3C 00 3E 00]` juste après un paquet de Note On : les deux Note Off sont perdus.
- **Pourquoi l'orgue** : un son de piano s'éteint de lui-même, une note bloquée passe inaperçue ; un orgue tient la note indéfiniment.
- **Autre cause possible, non corrigée** : une écriture GATT qui échoue est abandonnée (`MIDI OUT (BT) échoué` dans la console), et le relâchement d'un accord produit une rafale d'écritures, une par note. Si des notes restent encore bloquées en 1.7.3, chercher ce message dans la console.
- **Pistes de la revue 1.7.3** (`docs/revue-code-1.7.3.md`, n° 1) : le repli sur `writeValueWithResponse` échoue probablement aussi (la norme BLE MIDI n'impose que l'écriture sans réponse), donc un échec perd le message. Correctif proposé : renvoyer au piano le paquet reçu **tel quel** (une écriture par notification au lieu d'une par message, sans passer par le parseur, comme le loopback USB), et réessayer une écriture échouée. Hypothèse à vérifier : sur Android avant la version 13, notifications et écritures sur la même caractéristique partagent un tampon. À relever sur la tablette : `characteristic.properties`, les messages d'échec, le nombre de Note Off reçus et réécrits, la version d'Android.
- **Défaut mineur restant** : `parseSysex` n'annule pas le running status, alors qu'un SysEx devrait le faire. Sans effet ici (le piano n'envoie pas de SysEx pendant le jeu).
- **Précisions du 2026-11-05** (utilisateur, et implémentation MIDI du FP-30X dans `docs/DOC_FP30X/FP-30X_MIDI_Imple_eng01_W.pdf`) :
  - **pourquoi le loopback** : le Program Change de l'application règle une partie GM2 du piano (canal 1), distincte du son du clavier. Pour ne pas entendre les deux à la fois, l'utilisateur coupe le son du clavier **à la main** (Local Off : Function + fa le plus grave) à chaque mise sous tension, et l'application renvoie les touches au piano. Sans loopback, le piano est muet (essai d'avril 2026, commit `4d548ec`). Le loopback est donc indispensable tant que le Local Off est en place ;
  - **l'application ne peut pas faire le Local Off elle-même par CC122** : le tableau d'implémentation (p. 17) indique Local On/Off « Transmitted : O, Recognized : X ». Le piano envoie le CC122 quand on fait le raccourci, mais ne le reçoit pas ;
  - **la pédale n'est pas la seule cause** : les notes restent tenues même sans toucher la pédale de sustain (CC64, que le piano envoie aussi et qui passe par le même loopback : un relâchement de pédale perdu bloquerait toutes les notes). Au relevé sur la tablette, compter aussi les CC64 ;
  - le piano n'envoie pas d'Active Sensing (p. 17) : le scénario `[80 80 FE …]` ne se produit pas avec le FP-30X ;
  - piste à tester : d'après le support Roland, le son choisi sur le piano se joue sur le **canal 4**. Si un Bank Select + Program Change envoyé sur le canal 4 change le son du clavier lui-même (y compris pour les sons GM2, `msb:121`, ce que la documentation ne dit pas), le Local Off et le loopback deviennent inutiles, et ce bug disparaît avec eux.

## 9. Animation des effets piano : les 7 CC sont renvoyés à chaque frame

- **Statut** : ouvert
- **Constaté** : 2026-10-14, revue de code (`docs/revue-code.md`, n° 2) ; retard non mesuré
- **Où** : `src/ui/fx-overlay.svelte.ts`, `animateToValues()` (rappel `onFrame`), puis `applyMidiFxValue()` (`src/fx/midi-fx.ts`)
- **Diagnostic** : à chaque frame d'une animation (preset, Reset, ↺), `setControlValue(…, true)` est appelé pour chacun des 7 contrôles, que sa valeur ait changé ou non, et chaque appel envoie un CC : environ 140 messages pour une animation de 320 ms. Le Reset en envoie autant quand tout est déjà au neutre.
- **Conséquences** : en BLE, chaque message est une écriture GATT, faite l'une après l'autre et affichée dans la console. Si la liaison suit moins vite que l'animation, la file grossit, et un changement d'instrument ou un arrêt d'urgence appuyé juste après attend qu'elle se vide. Sans effet notable en USB.
- **Piste de correction** : n'envoyer un CC que si la valeur arrondie diffère de `MIDI_FX_STATE` ; ne pas animer quand les cibles sont déjà atteintes. Ce que reçoit le piano ne change pas.

## 10. Reprise après pause, puis Stop rapide : `TypeError`

- **Statut** : ouvert
- **Constaté** : 2026-10-14, revue de code (`docs/revue-code.md`, n° 5)
- **Où** : `src/audio/playback.ts`, `togglePlayPause()`, callback `.then()` de la reprise
- **Scénario** : un son en pause ; ▶, puis STOP (ou un autre son) avant que `play()` ne soit résolu.
- **Diagnostic** : le callback relit `STATE.currentAudio!` et `STATE.currentSoundItem!` sans vérifier qu'ils sont encore là : après un Stop, `getPlaybackRange(null)` lève une `TypeError`. Si un autre son a été lancé, il reçoit un fondu de 150 ms et un événement `resume` qui ne le concernent pas. Pas de `.catch()` sur `play()`.
- **Conséquences** : erreur dans la console ; petit creux de volume possible sur le nouveau son.
- **Piste de correction** : mémoriser la piste et le son avant `play()`, vérifier `STATE.currentAudio === audio` dans le `.then()` (comme `playSound`), ajouter un `.catch()`.

## 11. Volume déplacé pendant un fondu d'entrée : ignoré

- **Statut** : ouvert
- **Constaté** : 2026-10-14, revue de code (`docs/revue-code.md`, n° 6)
- **Où** : `src/audio/playback.ts`, `fadeAudio()` et `setAudioVolume()`
- **Scénario** : on lance un son et on baisse le volume dans les 300 ms du fondu d'entrée (150 ms pour une reprise).
- **Diagnostic** : `setAudioVolume` applique la valeur, mais le fondu en cours l'écrase à la frame suivante et termine sur la cible fixée à son lancement.
- **Conséquences** : le curseur affiche la nouvelle valeur, le son reste à l'ancienne jusqu'au prochain mouvement du curseur.
- **Piste de correction** : dans `setAudioVolume`, annuler un fondu d'entrée en cours (pas un fondu de sortie), ou faire lire `STATE.audioVolume` au fondu d'entrée à chaque pas.

## 12. Statut Wake Lock « actif » après sa libération

- **Statut** : ouvert
- **Constaté** : 2026-10-14, revue de code (`docs/revue-code.md`, n° 9)
- **Où** : `src/wake-lock.ts`, lu par `src/ui/components/AboutPopup.svelte`
- **Diagnostic** : le navigateur libère le verrou quand la page passe en arrière-plan. `STATE.wakeLock` garde l'objet libéré : si la nouvelle demande échoue au retour au premier plan, la popup À propos affiche toujours « Wake Lock : actif ✓ ».
- **Piste de correction** : tester `!STATE.wakeLock.released`, ou remettre `STATE.wakeLock` à `null` sur l'événement `release`.

## 13. Instrument et effets non renvoyés au piano à la connexion ou à la reconnexion

- **Statut** : ouvert
- **Constaté** : 2026-11-05, revue de code (`docs/revue-code-1.7.3.md`, n° 2)
- **Où** : `src/midi/connection.ts` (`onStatusChange` à `connected`, branche USB de `selectMidiConnection`), `src/ui/midi-ui.svelte.ts` (`selectInstrument`)
- **Scénarios** :
  - en Bluetooth, la liaison tombe (piano éteint puis rallumé) et on se reconnecte : seul le volume (CC7) est renvoyé ;
  - on appuie sur un instrument avant d'être connecté : il est surligné, mais rien n'est envoyé.
- **Diagnostic** : à la connexion, l'application ne renvoie que le volume. L'instrument surligné (`instruments.active`) et les effets affichés (`MIDI_FX_STATE`) ne sont pas renvoyés au piano.
- **Conséquences** : l'interface affiche un instrument et des effets que le piano n'applique pas, jusqu'à ce qu'on réappuie sur le bouton.
- **Piste de correction** : sur l'événement `status` passé à connecté (dans `bindMidiConnectionUI()`, pour garder les moteurs indépendants de l'interface), renvoyer l'instrument actif, puis les CC d'effets qui ne sont pas au neutre. À traiter avec le suivi du débranchement USB (revue 1.7.2, n° 4).

## 14. Un son remplacé sous le même nom n'est jamais mis à jour sur la tablette

- **Statut** : ouvert
- **Constaté** : 2026-11-05, revue de code (`docs/revue-code-1.7.3.md`, n° 3)
- **Où** : `src/sw.ts`, route `/sounds/` (`CacheFirst` dans `impro-audio`, sans révision) ; même chose pour `/images/`
- **Scénario** : on remplace un fichier de `public/sounds/` par une autre version sous le même nom, et on ajuste son `start` / `end` dans la configuration, puis on publie.
- **Diagnostic** : la configuration est mise à jour (precache), mais le Service Worker sert l'ancien fichier depuis `impro-audio` sans interroger le réseau. Le bouton « Vider le cache et recharger » ne vide pas ce cache (bug n° 7).
- **Conséquences** : les nouveaux repères s'appliquent à l'ancien fichier : le son démarre ou s'arrête au mauvais endroit, sans message d'erreur. Seul l'effacement des données du site rétablit le bon fichier, ce qui vide aussi le cache de tous les autres sons.
- **Piste de correction** : au minimum, une règle écrite dans le README (un fichier modifié change de nom). Sinon, versionner l'URL dans la configuration (`?v=2`), ou renouveler le cache audio en recopiant les entrées inchangées.

## 15. Une connexion Bluetooth en cours n'est pas annulée par un autre choix de connexion

- **Statut** : ouvert
- **Constaté** : 2026-11-05, à la lecture du code (comparaison avec `chord-finder-midi`, `src/useBluetoothMIDI.js`)
- **Où** : `src/midi/bluetoothMIDI.ts` (`connect()`, `disconnect()`), `src/midi/connection.ts` (`selectMidiConnection`)
- **Scénario** : on choisit « Bluetooth MIDI », on choisit le piano dans le sélecteur ; pendant la connexion (statut `connecting`, jusqu'à 3 essais espacés), on choisit le piano USB ou « — Connexion MIDI — » dans la liste d'un autre panneau.
- **Diagnostic** :
  1. `selectMidiConnection` ne déconnecte le Bluetooth que si son statut est déjà `connected` : une connexion en cours n'est pas arrêtée ;
  2. même appelé, `disconnect()` n'incrémente pas `#attemptId` : la tentative en cours ne voit pas qu'elle est périmée, termine `gatt.connect()` et passe à `connected`.
- **Conséquences** : quelques instants après le choix de l'USB (ou de « aucune connexion »), l'application repasse d'elle-même en Bluetooth (`STATE.midiOutput = null`, badge « BT ») : le choix de l'utilisateur est écrasé sans qu'il l'ait demandé.
- **Piste de correction** : `disconnect()` incrémente le compteur de tentatives (comme `ctx.attempt` dans chord-finder) ; `selectMidiConnection` appelle `disconnect()` quel que soit le statut Bluetooth.

## 16. Lien GATT laissé ouvert après un échec de connexion Bluetooth

- **Statut** : ouvert
- **Constaté** : 2026-11-05, à la lecture du code (comparaison avec `chord-finder-midi`, qui a corrigé le même défaut en 0.6.x)
- **Où** : `src/midi/bluetoothMIDI.ts`, `connect()`
- **Scénario** : `gatt.connect()` réussit, puis `getPrimaryService`, `getCharacteristic` ou `startNotifications` échoue (ou les 3 essais échouent) ; ou bien une tentative devenue périmée (nouvelle connexion lancée entre-temps) termine son `gatt.connect()`.
- **Diagnostic** : l'erreur remonte au `catch`, qui passe au statut `error` sans fermer le lien GATT ; une tentative périmée fait `return` sans le fermer non plus. Le lien n'est refermé qu'au `#cleanup()` de la connexion suivante, s'il y en a une.
- **Conséquences** : le piano reste connecté à la tablette sans que personne n'écoute ses notifications. Un FP-30X n'accepte qu'une connexion BLE MIDI : aucun autre appareil (téléphone avec l'application Roland, par exemple) ne peut s'y connecter, et l'interface affiche une erreur alors que le piano se croit connecté.
- **Piste de correction** : en cas d'échec, et dans une tentative périmée qui ne vise plus ce piano, appeler `device.gatt.disconnect()` (comme `disconnectGatt()` et `ctx.target` dans chord-finder).
