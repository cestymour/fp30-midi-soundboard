# Bugs

Journal des bugs repérés. Un bug trouvé en chemin est d'abord noté ici, dans « Ouverts », avec son diagnostic : scénario, cause, conséquences, correctif proposé. L'utilisateur décide ensuite s'il faut le corriger, et quand. Une fois corrigé (un commit par bug), il passe dans « Fermés » en une ligne. Les numéros ne sont jamais réutilisés : le code et les tests y renvoient (« bug n° 11 »).

Les diagnostics complets des bugs fermés restent dans l'historique git : `git show e90747e:docs/bugs.md`.

## Ouverts

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
