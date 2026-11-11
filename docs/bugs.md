# Bugs

Journal des bugs repérés. Un bug trouvé en chemin est d'abord noté ici, dans « Ouverts », avec son diagnostic : scénario, cause, conséquences, correctif proposé. L'utilisateur décide ensuite s'il faut le corriger, et quand. Une fois corrigé (un commit par bug), il passe dans « Fermés » en une ligne. Les numéros ne sont jamais réutilisés : le code et les tests y renvoient (« bug n° 11 »).

Les diagnostics complets des bugs fermés restent dans l'historique git : `git show e90747e:docs/bugs.md`.

## Ouverts

### 28. Tablette Android 6 : l'appli ne s'ouvre pas hors ligne

- **Scénario** : sur la tablette de scène (Android 6, Chrome 106), l'appli installée est ouverte en mode avion. Chrome affiche le dinosaure et « Aucun accès à Internet ». Sur un téléphone récent, la même appli s'ouvre hors ligne.
- **Ce qui est vérifié** (2026-11-11) : le code n'est pas en cause a priori. Sur Chromium 106 (snapshot 1036838, Windows, sans interface), la build 1.15.0 et le site de production s'ouvrent hors ligne. Le Service Worker s'enregistre, prend la main, précache les 24 fichiers de l'appli, puis sert `…/` et `…/index.html` hors ligne (réponses 200 venues du Service Worker). Le `sw.js` construit n'utilise pas de syntaxe inconnue de Chrome 106. Le stockage persistant n'est pas accordé (`false`).
- **Causes possibles**, à départager sur la tablette :
  1. Service Worker absent ou effacé : sur une tablette presque pleine, sans stockage persistant, Chrome peut effacer toutes les données du site, Service Worker compris.
  2. L'icône de l'écran d'accueil pointe vers une autre adresse que la production (par exemple `localhost` via `adb reverse`, ou une ancienne URL) : le Service Worker de la production ne la couvre pas.
  3. Lancement depuis l'icône en mode avion qui échoue sur Android 6 (moins probable).
- **Conséquences** : sans réseau, l'appli est inutilisable en spectacle sur la tablette de scène.
- **À faire pour le diagnostic** : 1) en ligne, lire les lignes Service Worker et Stockage de la section « Hors ligne » de la popup ⚙ ; 2) en ligne, regarder dans `chrome://serviceworker-internals` si le Service Worker de `cestymour.github.io/fp30-midi-soundboard/` est activé ; 3) en mode avion, ouvrir l'adresse de production dans un onglet Chrome normal plutôt que par l'icône. Si l'onglet marche et pas l'icône, réinstaller l'icône depuis la production (cause 2). Si rien ne marche, c'est la cause 1 : vérifier l'espace libre de la tablette ; 4) au besoin, inspecter la tablette depuis le PC (`chrome://inspect`, `adb` à installer).
- **Correctif proposé** : selon la cause trouvée. Pour la cause 1, faire de l'état du Service Worker et du stockage persistant un point de `docs/checklist.md` à vérifier avant chaque spectacle.

## Décisions (comportements voulus)

- **Changer de musique coupe la précédente net**, sans fondu de sortie : la suivante doit partir tout de suite (n° 1).
- **Court fondu de sortie des musiques à l'arrêt d'urgence** (n° 18).
- **Un curseur de volume saute à l'endroit touché** : glisser et toucher doivent marcher tous les deux.
- **Pas de connexion Bluetooth automatique au lancement** : ouvrir l'appli sur un second appareil ne doit pas prendre le piano au premier.
- **La fin d'une musique avec `end` n'est pas détectée quand la page est en arrière-plan** (boucle `requestAnimationFrame` arrêtée) : pas de correctif à base de minuterie, le Wake Lock rend le cas rare.

## Fermés

| N° | Bug | Correction | Version |
|---|---|---|---|
| 1 | Changement de musique : ancienne piste jamais libérée | `cancelFade()` libère la piste dont le fondu est interrompu | 1.7.1 |
| 2 | Un seul minuteur partagé entre deux fondus simultanés | un fondu annule le précédent, minuteur local | 1.7.1 |
| 3 | Pas de connexion USB automatique au piano au chargement | `autoConnectUsbPiano()` | 1.7.1 |
| 4 | Ancien Service Worker : sons jamais mis en cache sur GitHub Pages | nouveau Service Worker (Workbox) | 1.7.0 |
| 5 | Barre de progression d'un son affichée après l'arrêt | remise à 0 sur l'événement `stop` | 1.7.1 |
| 6 | Icône de volume mise à jour sur un seul panneau | icône dérivée du volume partagé | 1.7.1 |
| 7 | « Vider le cache et recharger » ne vidait aucun cache | « Mettre à jour l'application » (`src/app-update.ts`) | 1.9.0 |
| 8 | Bluetooth : notes qui restent tenues (parseur BLE, renvoi des notes au piano) | patchs et effets sur le canal 4 : plus de Local Off ni de renvoi des notes | 1.8.0 |
| 9 | Animation des effets piano : les 7 CC renvoyés à chaque image | seules les valeurs qui changent sont envoyées | 1.8.0 |
| 10 | Reprise après pause puis Stop rapide : `TypeError` | la reprise vérifie que la piste est toujours la courante | 1.9.0 |
| 11 | Volume déplacé pendant un fondu d'entrée : ignoré | le fondu d'entrée s'arrête | 1.9.0 |
| 12 | Wake Lock affiché « actif » après sa libération | `STATE.wakeLock` remis à `null` sur `release` | 1.9.0 |
| 13 | Instrument et effets non renvoyés au piano à la connexion | renvoyés à chaque connexion (événement `connected`) | 1.8.0 |
| 14 | Son remplacé sous le même nom jamais mis à jour sur la tablette | empreinte du contenu dans l'adresse de chaque son et image (`?v=…`) | 1.15.0 |
| 15 | Connexion Bluetooth en cours non annulée par un autre choix | compteur de tentatives, `selectionId` | 1.8.0 |
| 16 | Lien GATT laissé ouvert après un échec de connexion | le lien est refermé | 1.8.0 |
| 17 | Câble USB débranché ou branché après le lancement : non suivi | port débranché oublié, piano branché connecté | 1.8.0 |
| 18 | Arrêt d'urgence : un orgue avec beaucoup d'effet continue de sonner | All Sound Off en premier sur le canal du clavier | 1.8.0 |
| 19 | Un seul Reset remettait à zéro effets piano et effets audio | un Reset et un témoin par type d'effets | 1.9.0 |
| 20 | `MediaElementTrack.load()` rendait la main avant la fin du chargement | `load()` renvoie la promesse de chargement | 1.9.0 |
| 21 | Son qui grésille avec les effets audio à fond | limiteur en sortie (−2 dBFS), transparent en dessous | 1.9.0 |
| 22 | Une piste libérée gardait son élément `<audio>` et son décodeur | `dispose()` vide la source | 1.9.0 |
| 23 | Bas de l'écran coupé dans un onglet Chrome (`100vh`) | `100dvh`, après `100vh` en repli | 1.9.0 |
| 24 | Téléphone en paysage : « Reset » et volume coupés dans la barre MIDI | barre réorganisée (icônes seules depuis la 1.12.0) | 1.9.0 |
| 25 | Popups des effets : repères du neutre peu visibles, coupés aux extrémités | repères redessinés | 1.9.1 |
| 26 | Chrome 106 : couleurs mélangées absentes (`color-mix()`) | `color-mix()` réécrit en `rgb()` à la build (`tools/color-mix-compat.ts`) | 1.10.1 |
| 27 | Cache des sons : anciennes versions jamais effacées | « Télécharger tous les sons » efface les entrées obsolètes, une fois tout téléchargé | 1.15.0 |
