# Sons et musiques : règles et état des fichiers

Comment choisir, ranger, présenter et traiter les sons et les musiques de l'application. Le pourquoi (comment l'appli sert pendant un spectacle) est dans `docs/usage-scene.md` : le lire avant de choisir ou de présenter un son. Le format de la configuration est dans le README (« Configuration »).

## Où va un son

| Onglet | Type | Ce qu'il reçoit |
|---|---|---|
| Animaux | sons | Cris d'animaux, courts. Grille fixe de 32 cases (`gridType: 'animals'`). |
| Bruits | sons | Bruitages courts, entendus par les personnages. 32 cases. Pas de doublon avec les sons MIDI du piano (rire, cri, pas, applaudissements, téléphones, portes, voiture, sirène, train, avion, laser, coup de feu, coup de poing, explosion, pluie, tonnerre, vent, chien, galop…). |
| Ambiances | musiques | Fonds sonores longs (ville, gare, mer, forêt…). Un son long qui sonne comme une ambiance (grillons, cigales) va ici : il y gagne fondus et effets. |
| Musiques | musiques | Musiques **cultes hors film**, connues, qui habillent une scène en cours. Pas de doublon avec Films. |
| Films | musiques | Thèmes de film, avec leur affiche. Le musicien pense « la musique de tel film » : il les retrouve par l'image. |
| Transition (bouton ♫) | à part | Musiques rythmées pour relancer le public entre deux impros (`src/config/transition.config.ts`). |

Les styles qui se jouent bien au piano (tango, ragtime, valse, boogie, les classiques du répertoire) restent au piano : voir « À apprendre au piano » dans `docs/todo.md`.

## Présenter une tuile

- **Repère visuel d'abord** : position, couleur, famille, emoji, dessin ou affiche. Le texte vient ensuite, avec peu de mots en gros.
- **Dessins SVG** (`svg: '<nom>'`, fichier `src/icons/<nom>.svg`) : dessins et emojis se côtoient, un emoji juste reste un emoji. Une tuile reçoit un dessin quand son emoji a été pris faute de mieux (l'objet entendu n'a pas d'emoji : un dodo pour la mouette, une scie de menuisier pour la tronçonneuse), quand des tuiles différentes partagent le même emoji (trois 🔫), ou quand l'emoji ne s'affiche pas sur la tablette (Android 6 : harpe 🪉, flûte 🪈, âne 🫏 donnent un carré vide).
  - **Le dessin part du son entendu**, pas de l'emoji disponible : une mouette pour le cri de mouette, un pigeon et pas une colombe.
  - **Instrument** : l'instrument lui-même s'il est connu ; pour un son abstrait ou un instrument peu connu, l'image évoque la situation et le libellé dit l'instrument (une télé rétro pour le Rhodes, une planète pour le piano électrique).
  - **Style** : le niveau de détail d'un emoji (quelques formes, quelques tons, pas de fioriture), les vraies couleurs de l'objet, des aplats sans contour, viewBox 0 0 64 64, un animal de profil tourné vers la gauche. Le dessin occupe le carré comme un emoji ; un objet long et plat (pistolet, flûte) paraît plus petit, comme son emoji.
  - **Dessin écarté** : le fichier reste dans `src/icons/` et la tuile le garde en commentaire (`icon: '🔧', /* svg: 'cle-voiture', */`), pour le remettre sans le redessiner. `config.test.ts` signale un dessin que la config ne nomme nulle part.
- **Musiques** : en gros (`name`), ce qui identifie le mieux la musique pour le commun des gens (titre, artiste ou usage : « Entrée du cirque », « Strip-tease ») ; en petit (`subtitle`), ce qu'elle fait entendre ou la situation. Le titre complet va dans `title` (info-bulle).
- **Familles de l'onglet Musiques** : par ambiance et par genre, une couleur par famille (les tuiles la prennent, classe `musique-tuile`). Les familles comiques et dramatiques ne se mélangent pas. 4 colonnes, 2 tuiles par ligne (`catCols: 2`) ; `colSizes` fixe le nombre de familles par colonne, à mettre à jour si on ajoute ou retire une famille.
- **Moment marquant** : réglé avec `start` (et `end` si besoin). Ce sont les premières secondes qui comptent.
- Une musique annoncée dont le mp3 n'est pas encore là : classe `musique-manquant` dans `catClass` (tuile en pointillés rouges, un clic ne joue rien), à retirer quand le fichier arrive.

## Fichiers

- **Emplacement** : `public/sounds/<onglet>/` (`animaux`, `bruits`, `ambiances`, `musiques`, `films`, `transitions`), affiches dans `public/images/films/`.
- **Nom** : minuscules, mots séparés par `_`, sans espace, accent ni parenthèse (`il_etait_une_fois_dans_l_ouest_l_homme_a_l_harmonica.mp3`). Musiques de transition : `auteur_titre.mp3`. Affiche d'un film : même nom que l'`id` de la tuile.
- **Remplacer un fichier sous le même nom est possible** : à la build, chaque son et chaque image reçoit une empreinte de son contenu, ajoutée à son adresse (`?v=…`, `src/asset-url.ts`). Un fichier modifié change d'adresse : la tablette le télécharge (« Télécharger tous les sons »), puis efface l'ancienne version de son cache. Les suffixes `_v2` des fichiers existants restent tels quels ; inutile d'en ajouter.
- **Une tuile en commentaire est mise de côté, pas supprimée** : la ligne et son mp3 restent. Une ligne dont le mp3 n'existe plus est supprimée ; son `id` reste réservé (historique git) et n'est jamais réutilisé.
- **Poids** : tout part dans le cache hors ligne de la tablette (« Télécharger tous les sons »). Environ 205 Mo aujourd'hui : Films 73 Mo, Musiques 61 Mo, Ambiances 35 Mo, Transitions 27 Mo, Bruits 4,4 Mo, Animaux 3,2 Mo, affiches 2,5 Mo.

## Traitement audio

Aucune copie des originaux n'est gardée hors de git : on retraite toujours à partir de la version du dépôt (`git show HEAD:<fichier>`), jamais d'un fichier déjà réencodé deux fois.

- **Les fichiers restent entiers.** Le moment marquant se règle avec `start`, et la fin reste disponible. On ne coupe que par exception.
- **Une coupe est une coupe nette**, sans fondu : les fondus sont faits par l'application.
- **Compresser** = réencoder seulement (débit, pochette et métadonnées retirées). Tout autre traitement (fondu, normalisation, égalisation, limiteur…) est proposé à l'utilisateur avant d'être appliqué.
- **Mesure** : `ffmpeg`, filtre `ebur128` (LUFS intégré, crête vraie).

| Onglet | Niveau | Méthode | Encodage |
|---|---|---|---|
| Musiques, Transitions | −18 LUFS, crête ≤ −1,5 dBTP | `loudnorm` en deux passes | MP3 80 kb/s, 44,1 kHz stéréo, sans pochette |
| Films | −18 LUFS sur le passage joué | gain simple et limiteur (voir ci-dessous) | MP3 80 kb/s, 44,1 kHz stéréo, sans pochette |
| Bruits, Animaux | −18 LUFS | gain simple, limiteur seulement sur les crêtes qui saturent (6 dB au plus) | MP3 128 kb/s stéréo ou 64 kb/s mono, sans dépasser le débit d'origine |
| Ambiances | −24 LUFS | idem | idem |

Méthode de Films et Animaux (2026-11-11), à reprendre pour un nouveau fichier :

- **Mesurer le passage joué**, pas le fichier entier : de `start` à `end`, ou les 30 premières secondes après `start` pour une musique. C'est ce qu'on entend sur scène.
- **Laisser tel quel un écart faible** : moins de 1 dB, ou moins de 2 dB s'il faudrait monter le son (monter coûte du limiteur).
- **Son baissé** : gain seul ; limiteur seulement si l'encodage ferait dépasser 0 dBTP.
- **Son monté** : crête ≤ −1,5 dBTP après encodage, avec au plus 6 dB de limiteur (suréchantillonné ×4). Au-delà, le gain est réduit et le son reste sous la cible.
- Vérifier après coup que la durée n'a pas changé (sinon `start` et `end` tombent ailleurs).

Un fichier aux crêtes trop denses reste sous la cible plutôt que d'être écrasé : on ne garde le gain que s'il rapproche le niveau de la cible (liste des sons restés sous la cible dans `docs/todo.md`).

## Fichiers coupés ou retouchés

Tous les autres fichiers sont entiers.

- **Toccata (Bach)** : de 0:00 à 1:08 (9 minutes à l'origine, coupure naturelle au bout d'une minute).
- **Danse des chevaliers (Prokofiev)** : les 105 premières secondes (la suite est un autre mouvement).
- **Duo des fleurs (Lakmé)** : de 1:04 à 2:28.
- **Bomb Run** : partie du milieu retirée (de 1:11.1 à 1:48.4), avec un fondu enchaîné de 1 s entre les deux parties ; 1:37 au lieu de 2:15.
- **Peer Gynt (Morning Mood)** : coupé à 3:58, la fin est retirée.
- **Dans l'antre du roi de la montagne (Grieg)** : début remonté (le crescendo le rendait presque inaudible à la tuile) : gain de +12 dB jusqu'à 1:25, puis rampe jusqu'à 0 dB à 1:40 ; la fin est intacte. Le passage de la tuile est vers −24 LUFS.
- **Musique d'ascenseur** : version de 57 s.
- **Jungle (Ambiances)** : de 6:00 à 7:30 d'un enregistrement de 9:49.
- **Métro (Ambiances)** : passage presque silencieux retiré, de 0:04 à 0:13 (coupe nette) ; 1:51 au lieu de 2:00.

## Écartés de l'onglet Ambiances

- **En commentaire** (mis de côté, fichier gardé) : Café et Restaurant (doublons de Discussions dedans, qui sonne le mieux des trois), Salle d'arcade (rarement utile).

## Écartés de l'onglet Musiques

Pour ne pas les reproposer :

- **Retirés de l'onglet** (leur `id` reste réservé) : Boléro (montée trop longue), Hallelujah et Canon de Pachelbel (à apprendre au piano), The Final Countdown, Don't Stop Me Now, Billie Jean, Looney Tunes, La Marseillaise, Vol du bourdon (déjà dans Films, Kill Bill), Stayin' Alive, Remise de diplôme (Pomp and Circumstance).
- **Jamais ajoutés** : Summertime, The Entertainer (à apprendre au piano), Happy, Halloween, Adagio for Strings (déjà dans Films, Platoon), et des musiques de film sans place dans Films (Tubular Bells, Axel F, Misirlou, Gabriel's Oboe).
- **En commentaire** (mis de côté, mp3 gardé) : Danse du sabre, Marche de Radetzky, We Are the Champions.
