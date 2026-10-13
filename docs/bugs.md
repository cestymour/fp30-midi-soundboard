# Bugs constatés pendant la refonte

La refonte ne change aucun comportement (voir `REFONTE.md`, règle 1) : les bugs repérés en chemin sont listés ici avec leur diagnostic, **sans être corrigés**. À la fin de la refonte, l'utilisateur décide lesquels corriger.

Statuts : **ouvert** (présent en production et sur `refonte`), **corrigé** (correctif ciblé après la fusion, daté), **corrigé par la refonte** (le nouveau code se comporte autrement par construction, sans correctif ciblé).

**Décision de l'utilisateur (2026-10-13, phase 6)** : corriger les n° 1, 2, 3, 5 et 6, **après** la fusion de la refonte dans `main`, un commit par bug. Le n° 5 est bien un bug (pas un repère « déjà joué » à garder).

---

## 1. Changement de son direct : pas de fondu de sortie, ancienne piste jamais libérée

- **Statut** : corrigé (2026-10-14) : `cancelFade()` libère (`dispose()`) la piste dont le fondu de sortie est interrompu. Le changement de son reste sans fondu croisé (l'ancien son est coupé net), comme avant
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

- **Statut** : ouvert, à corriger après la fusion
- **Constaté** : phase 3 (2026-10-13), à la lecture du code ; **à confirmer sur la tablette** avec le piano branché en USB avant d'ouvrir l'app
- **Où** : v1 : `js/midi.js`, `populateMidiSelects(true)`, et l'écouteur `change` délégué sur `#panels` dans `js/app.js` (`initMidiSelectDelegation`) ; refonte : `src/ui/midi-ui.svelte.ts`, `populateMidiSelects(true)`, qui reproduit le comportement (piano affiché dans la liste, sans connexion)
- **Diagnostic** : au premier chargement, si une sortie MIDI dont le nom contient « piano » existe, le code la sélectionne dans la liste puis fait `sel.dispatchEvent(new Event('change'))`. Cet événement est créé **sans `bubbles: true`** : il ne remonte pas jusqu'à `#panels`, où se trouve le seul écouteur. `handleMidiSelectChange()` n'est donc jamais appelé.
- **Symptôme attendu** : la liste affiche le piano mais le badge reste « Non connecté », et les boutons d'instruments n'ont aucun effet (« Pas de connexion MIDI active » dans la console) tant qu'on ne resélectionne pas le piano à la main.
- **Piste de correction** : `new Event('change', { bubbles: true })`. Le README annonce cette auto-connexion (« Auto-connects to the Roland FP-30X on page load »).

## 4. Ancien Service Worker : les sons ne sont pas mis en cache sur GitHub Pages

- **Statut** : corrigé par la refonte (phase 2), présent en production tant que `v1-vanilla` y est
- **Constaté** : phase 2 (2026-10-13), test en Chromium headless + `curl` sur la production
- **Où** : ancien `sw.js` (tag `v1-vanilla`), fonction `handleAudio()`
- **Diagnostic** : les éléments `<audio>` envoient des requêtes `Range` (`bytes=0-`), auxquelles GitHub Pages répond `206 Partial Content` (vérifié avec `curl -H "Range: bytes=0-"`). L'ancien SW fait `cache.put(request, response)` sur cette réponse 206, ce que l'API Cache refuse (promesse rejetée, non attendue, donc silencieuse). En test, le cache `impro-audio-1.6.4` reste vide après lecture de sons.
- **Conséquence** : en production actuelle, le hors ligne des sons ne repose que sur le cache HTTP du navigateur, sans garantie. La consigne « jouer chaque son une fois avant le spectacle » ne protège donc pas vraiment.
- **Dans la refonte** : le nouveau SW (`src/sw.ts`) télécharge le fichier entier sans en-tête `Range` au premier accès, le met en cache (200), puis sert les plages demandées depuis le cache (`RangeRequestsPlugin`). Vérifié hors ligne, seek compris.

## 5. La barre de progression d'un bouton de son reste affichée après l'arrêt

- **Statut** : ouvert, à corriger après la fusion
- **Constaté** : phase 5 (2026-10-13), à la lecture du code, confirmé par le scénario de `tools/regression` sur `v1-vanilla`
- **Où** : v1 : `updateTransportUI()` (`js/app.js`) ; refonte : `SoundButtonState.progress` dans `src/ui/transport.svelte.ts`
- **Diagnostic** : la progression est dessinée par le pseudo-élément `.sound-btn::before`, de largeur `var(--progress)`, visible quel que soit l'état du bouton. À l'arrêt, le code prévu pour la remettre à zéro cherche `.sound-btn.playing, .sound-btn.paused`, mais `stopSound()` a déjà retiré ces classes : il ne trouve rien, et `--progress` garde sa dernière valeur (la classe `paused` n'est d'ailleurs jamais posée).
- **Conséquences** : chaque son joué puis arrêté garde un remplissage partiel (teinte d'accent à 25 %) jusqu'à sa prochaine lecture ; au relancement, la barre repart de cette position avec la transition CSS (0,05 à 0,3 s) au lieu de partir de zéro. Peut aussi être vu comme un repère « déjà joué », d'où la question : bug ou fonctionnalité ?
- **Piste de correction** : remettre `progress` à `'0%'` sur l'événement `stop` (pour le son arrêté).

## 6. Icône de volume : seul le panneau manipulé est mis à jour

- **Statut** : ouvert, à corriger après la fusion (mineur)
- **Constaté** : phase 5 (2026-10-13), à la lecture du code, confirmé par le scénario de `tools/regression` sur `v1-vanilla` (volume MIDI à 20 : 🔈 sur le premier panneau, 🔊 sur le second)
- **Où** : v1 : `buildMidiControls()` / `buildAudioControls()` et `syncMidiSliders()` / `syncAudioSliders()` ; refonte : `src/ui/components/VolumeControl.svelte`
- **Diagnostic** : le volume (MIDI ou audio) est partagé entre tous les panneaux du même type : curseur, pourcentage et valeur sont synchronisés. Mais l'emoji (🔇 🔈 🔉 🔊) n'est recalculé que sur le panneau où l'on a bougé le curseur ; il vaut 🔊 au départ sur tous les panneaux.
- **Conséquences** : après avoir baissé le volume audio à 0 sur l'onglet Films, l'onglet Animaux affiche 🔊 avec un curseur à 0 %.
- **Piste de correction** : calculer l'emoji à partir de la valeur partagée (`STATE.midiVolume`, `STATE.audioVolume`) plutôt que dans un état local au panneau.
