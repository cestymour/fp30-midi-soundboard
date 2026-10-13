# Bugs constatés pendant la refonte

La refonte ne change aucun comportement (voir `REFONTE.md`, règle 1) : les bugs repérés en chemin sont listés ici avec leur diagnostic, **sans être corrigés**. À la fin de la refonte, l'utilisateur décide lesquels corriger.

Statuts : **ouvert** (présent en production et sur `refonte`), **corrigé par la refonte** (le nouveau code se comporte autrement par construction, sans correctif ciblé).

---

## 1. Changement de son direct : pas de fondu de sortie, ancienne piste jamais libérée

- **Statut** : ouvert
- **Constaté** : phase 1 (2026-10-13), à la lecture du code
- **Où** : `src/audio/audio.ts`, `stopSound()` et `playSound()` ; appelés par le clic d'un bouton son dans `src/app.ts` (`buildSoundBtn`)
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

- **Statut** : ouvert (mineur)
- **Constaté** : phase 3 (2026-10-13), à la lecture du code
- **Où** : `src/audio/audio.ts`, `fadeAudio()` (variables de module `_fadeTimer` et `_fadingAudio`)
- **Scénario** : un fondu démarre alors qu'un autre est en cours sans passer par `cancelFade()`, par exemple deux clics rapides sur pause (fondu de 150 ms) : `togglePlayPause()` n'appelle pas `cancelFade()`, et `STATE.isPaused` ne passe à `true` qu'à la fin du premier fondu.
- **Diagnostic** : le second `fadeAudio()` écrase `_fadeTimer` sans arrêter le premier intervalle. Quand le premier atteint sa cible, il fait `clearInterval(_fadeTimer)`, ce qui arrête **le second** fondu, et seul le callback du premier est appelé.
- **Conséquences** : volume ou état de pause incohérents dans des cas de clics très rapides. Pas observé en usage.
- **Piste de correction** : chaque fondu garde son propre timer dans une variable locale, et `fadeAudio()` annule le fondu en cours avant d'en démarrer un nouveau.

## 3. L'auto-connexion USB au piano au chargement ne se fait pas

- **Statut** : ouvert
- **Constaté** : phase 3 (2026-10-13), à la lecture du code ; **à confirmer sur la tablette** avec le piano branché en USB avant d'ouvrir l'app
- **Où** : `src/midi/midi.ts`, `populateMidiSelects(true)` ; écouteur `change` délégué sur `#panels` dans `src/app.ts` (`initMidiSelectDelegation`)
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
