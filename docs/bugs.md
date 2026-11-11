# Bugs

Journal des bugs repérés. Un bug trouvé en chemin est d'abord noté ici, dans « Ouverts », avec son diagnostic : scénario, cause, conséquences, correctif proposé. L'utilisateur décide ensuite s'il faut le corriger, et quand. Une fois corrigé (un commit par bug), il passe dans « Fermés » en une ligne. Les numéros ne sont jamais réutilisés : le code et les tests y renvoient (« bug n° 11 »).

Les diagnostics complets des bugs fermés restent dans l'historique git : `git show e90747e:docs/bugs.md`.

## Ouverts

### 27. Cache des sons : les anciennes versions ne sont jamais effacées, ni mises à jour

- **Statut** : ouvert (constaté le 2026-11-11, à la lecture du code ; non vérifié sur la tablette)
- **Où** : `src/sw.ts` (route `/sounds/`, `CacheFirst` dans `impro-audio`, sans expiration) et `src/offline.ts` (`downloadMissing()` ajoute ce qui manque, n'enlève rien)
- **Scénarios** :
  1. Un fichier est renommé ou retiré de la config : son ancienne version reste dans `impro-audio` pour toujours. C'est arrivé en 1.12.0 (films et bruits renommés, environ 100 Mo) et le 2026-11-11 (Films et Animaux nivelés, renommés en `_v2`, environ 80 Mo).
  2. Un fichier est remplacé sous le même nom : la tablette garde l'ancienne version et ne charge jamais la nouvelle (voir le n° 14). La règle des nouveaux noms (`docs/sons.md`) l'évite ; pas encore arrivé en production (Bruits et Ambiances ont été nivelés avant leur première publication, en 1.10.0).
- **Conséquences** : stockage de la tablette qui grossit à chaque changement de sons (jusqu'à environ 180 Mo inutiles, si elle avait tout téléchargé avant chaque changement). Rien ne casse : chaque son joue.
- **Vérification possible** : sur la tablette, `chrome://inspect` → Application → Cache Storage → `impro-audio` : compter les entrées (68 sons + 36 affiches en usage, sans les transitions).
- **Correctif proposé** (à décider) : « Télécharger tous les sons » efface aussi de `impro-audio` (et `impro-images`) les entrées qui ne sont plus dans la config, sans retélécharger ce qui est à jour. Le compteur de la popup Paramètres peut afficher la place libérée.

## Décisions (comportements voulus)

- **Changer de musique coupe la précédente net**, sans fondu de sortie : la suivante doit partir tout de suite (n° 1).
- **Les sons ne sont jamais remplacés sous le même nom** : un fichier modifié prend un nouveau nom, sinon la tablette garde l'ancien dans son cache (n° 14, règle dans `docs/sons.md`).
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
| 14 | Son remplacé sous le même nom jamais mis à jour sur la tablette | non corrigé : voir « Décisions » | — |
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
