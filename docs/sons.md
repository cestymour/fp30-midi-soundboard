# Sons et musiques : règles et état des fichiers

Comment choisir, ranger, présenter et traiter les sons et les musiques de l'application. Le pourquoi (comment l'appli sert pendant un spectacle) est dans `docs/usage-scene.md` : le lire avant de choisir ou de présenter un son. Le format de la configuration est dans le README (« Configuration »).

## Où va un son

| Onglet | Type | Ce qu'il reçoit |
|---|---|---|
| Animaux | sons | Cris d'animaux, courts. Grille fixe de 32 cases (`gridType: 'fixed'`). |
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
- **Poids** : tout part dans le cache hors ligne de la tablette (« Télécharger tous les sons »). Environ 190 Mo aujourd'hui : Films 72 Mo, Musiques 60 Mo, Transitions 26 Mo, Ambiances 24 Mo, Bruits 3,3 Mo, Animaux 2,2 Mo, affiches 2,3 Mo.

## Traitement audio

On retraite toujours à partir de l'original, jamais d'un fichier déjà nivelé et réencodé :

- **Musiques, transitions, films, nouvelles ambiances** : les téléchargements d'origine, hors git, dans le dossier `DIVERS ORIGINAL` de l'utilisateur (MP3 192 kb/s le plus souvent ; pour les films, `tmp/_musiques/original` avant `tmp/_musiques/compressed`). Les fichiers du dépôt y ont été retrouvés par corrélation du signal, coupes comprises. Une autre version du même morceau (autre master, autre vitesse) n'est pas utilisée : il faudrait refaire les `start`.
- **Bruits, Animaux, premières ambiances, Rasputin, All Night, The Mojo Radio Gang, Mission Impossible, Kill Bill (Battle Without Honor), Il était une fois dans l'Ouest** : la version d'avant le nivellement, dans l'historique git (le commit parent de `449074e`, `2486e4f` ou `831e42c`), ou `DIVERS ORIGINAL` quand elle y est en meilleure qualité.
- **Sans original** (Dancing Queen, dont `DIVERS ORIGINAL` n'a qu'une autre version ; cigales, feu de cheminée, discussion de foule, modem 56k, tic-tac bombe) : la version du dépôt, réencodée une fois de plus.

- **Les fichiers restent entiers.** Le moment marquant se règle avec `start`, et la fin reste disponible. On ne coupe que par exception.
- **Une coupe est une coupe nette**, sans fondu : les fondus sont faits par l'application.
- **Compresser** = réencoder seulement (débit, pochette et métadonnées retirées). Tout autre traitement (fondu, normalisation, égalisation, limiteur…) est proposé à l'utilisateur avant d'être appliqué.
- **Mesure** : `ffmpeg`, filtre `ebur128` (LUFS intégré, crête vraie).

Règles de l'utilisateur (2026-11-14), qui priment sur tout le reste :

1. **80 kb/s au plus**, pour que l'application reste légère : MP3 80 kb/s CBR, ou Ogg Vorbis plafonné à 80 kb/s (`-maxrate`) pour les `.ogg` ; jamais plus que le débit du fichier en place.
2. **Aucun son ne sonne plus bas que son original.**
3. **Tout au niveau du Rockafeller Skank original : −9,6 LUFS**, sauf les Ambiances (−16 LUFS, voir le tableau). Un original plus fort garde au moins son niveau.
4. **Abîmer plutôt que baisser** : le limiteur travaille autant qu'il faut. Écouté et validé à l'oreille sur le Duo des fleurs (+17 dB) et Zarathoustra (+15 dB).

| Onglet | Niveau mesuré |
|---|---|
| Musiques, Transitions | −9,6 LUFS (ou plus, si l'original est plus fort) sur le fichier entier ; sauf Mario et Tetris, au niveau de leur original (−16,6 et −12,1), trop forts à −9,6 |
| Ambiances | −16 LUFS (ou plus, si l'original est plus fort) sur le fichier entier |
| Films | −9,6 LUFS, sur le passage joué |
| Animaux | −9,6 LUFS, sur le passage joué, ou passages forts (voir plus bas), gain plafonné à +25 dB |
| Bruits | −9,6 LUFS, sur le fichier entier, ou passages forts, gain plafonné à +25 dB |

Les cibles précédentes (−18, puis −14 LUFS, Ambiances 6 dB plus bas) manquaient de puissance sur scène, même avec l'enceinte à fond. À −9,6, les Ambiances étaient trop fortes à l'écoute (2026-11-14), et les sons courts montés de +30 à +48 dB (machine à écrire…) aussi.

Méthode, à reprendre pour un nouveau fichier :

- **Mesurer** le passage joué pour Films et Animaux : de `start` à `end`, ou les 30 premières secondes après `start` pour une musique. C'est ce qu'on entend sur scène.
- **Gain**, puis **limiteur** `alimiter` à −1 dBFS, suréchantillonné ×4 (`aresample` à 4 × la fréquence, attaque 5 ms, relâchement 80 ms, `level=0`, `latency=1` pour ne pas décaler le son), sans limite de réduction.
- **Encoder, mesurer, reprendre le gain** jusqu'à la cible. Le MP3 80 kb/s fait dépasser les crêtes au-dessus de 0 dBTP (jusqu'à +3 dB), comme les originaux du commerce (Rockafeller : +1,1) : ce n'est pas corrigé, car un plafond de crête plus bas plafonne le volume vers −11 LUFS. Dans l'application, tout passe en virgule flottante puis par le limiteur de sortie (`LIMITER_THRESHOLD_DB`, `src/audio/audio-engine.ts`), qui absorbe ces dépassements.
- **Sons courts** (Bruits, Animaux) : sur un son clairsemé (briquet, appareil photo), le volume intégré *baisse* quand on monte le gain, parce que les silences remontent et entrent dans la mesure. On vérifie donc aussi les **passages forts** : le volume momentané (400 ms) dépassé 10 % du temps. Le son est bon quand l'une des deux mesures atteint la cible et dépasse l'original.
- **Gain plafonné** : +25 dB pour Bruits et Animaux (au-delà, le limiteur écrase le son et remonte surtout le bruit de fond), +45 dB ailleurs (au-delà, on ne gagne presque plus rien). Le Lion fait exception : son original est déjà à −5 LUFS, et il lui faut +42 dB de gain pour ne pas finir sous l'original une fois limité.
- **Vérifier** que la durée n'a pas changé et que le son n'est pas décalé (sinon `start`, `end` et les moments de transition tombent ailleurs).

## Fichiers coupés ou retouchés

Tous les autres fichiers sont entiers.

- **Toccata (Bach)** : de 0:00 à 1:08 (9 minutes à l'origine, coupure naturelle au bout d'une minute).
- **Danse des chevaliers (Prokofiev)** : les 105 premières secondes (la suite est un autre mouvement).
- **Duo des fleurs (Lakmé)** : de 1:04 à 2:28.
- **Bomb Run** : partie du milieu retirée (de 1:11.1 à 1:48.4), avec un fondu enchaîné de 1 s entre les deux parties ; 1:37 au lieu de 2:15.
- **Peer Gynt (Morning Mood)** : coupé à 3:58, la fin est retirée.
- **Dans l'antre du roi de la montagne (Grieg)** : début remonté (le crescendo le rendait presque inaudible à la tuile) : gain de +12 dB jusqu'à 1:25, puis rampe jusqu'à 0 dB à 1:40 ; la fin est intacte. Le passage de la tuile (30 s après `start`) est vers −9 LUFS.
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
