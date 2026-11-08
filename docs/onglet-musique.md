# Onglet Musiques : état de la maquette

Document de travail (mis à jour le 2026-11-08). L'onglet est rempli dans `src/config/audio.config.ts` (id `musique`). C'est une **maquette** : l'organisation des familles est arrêtée (2e jet, 2026-11-08) ; le visuel et les libellés restent à revoir (voir `docs/todo.md`). Avant de choisir ou présenter une musique, lire `docs/usage-scene.md`.

Règle : l'onglet Musiques ne reçoit que des **musiques cultes** (hors film), connues, qui habillent une scène d'impro en cours. Les musiques de film vont dans l'onglet Films. Pas de doublon avec Films : *Adagio for Strings* (Platoon) et le *Vol du bourdon* (Kill Bill) n'y sont pas.

## 1. Décisions

| Sujet | Décision |
|---|---|
| Disposition | 4 colonnes, 2 tuiles par ligne dans une famille (`catCols: 2`). 11 familles : `colSizes: [3, 3, 2, 3]` fixe le nombre de familles par colonne (sans lui, le panneau en met `ceil(familles / 4)` par colonne). Au plus 5 rangées de tuiles par colonne. |
| Familles | Par ambiance et par genre. Visibles (titre, emoji, couleur). Chaque tuile prend la couleur de sa famille (classe `musique-tuile`, variable `--cat-accent`). Les familles comiques et dramatiques ne se mélangent pas. |
| Tuile | Un emoji. En gros (`name`), ce qui identifie le mieux la musique pour le commun des gens : titre, artiste ou usage. En petit (`subtitle`), ce qu'elle fait entendre ou la situation. |
| Fichiers | Gardés entiers ; le moment marquant est réglé avec `start` / `end`. Une coupe ne se fait qu'à la demande, et c'est une coupe nette, sans fondu (les fondus sont gérés par l'appli). |
| Volume | Tous les fichiers de l'onglet sont à −18 LUFS, crête ≤ −1,5 dBTP (`ffmpeg`, `loudnorm` en deux passes). MP3 80 kb/s, 44,1 kHz stéréo, sans image de couverture. `musique_ascenseur.mp3` a été remplacé le 2026-11-08 par une version de 57 s, traitée de la même façon. |
| Lignes commentées | Une tuile en commentaire est mise de côté, pas supprimée : la ligne et son mp3 restent (Marche de Radetzky, We Are the Champions, et Noël, à déplacer dans Ambiances). |

## 2. Les familles (35 tuiles affichées)

Organisation retenue le 2026-11-08, après quatre propositions comparées dans des onglets temporaires (supprimés depuis).

| Colonne | Famille | Tuiles |
|---|---|---|
| 1 | 🔥 Épique | Zarathoustra, Walkyries, O Fortuna |
| 1 | 🦇 Sombre, menace | Danse des chevaliers, Dies irae, Toccata de Bach, Lacrimosa |
| 1 | 🪖 Guerre | Bombardier (Bomb Run), Vietnam (Fortunate Son) *(We Are the Champions en commentaire)* |
| 2 | 🤡 Cirque, cabaret | Entrée du cirque, French cancan *(Radetzky en commentaire)* |
| 2 | 🏃 Burlesque, agitation | Galop burlesque (Guillaume Tell), Danse du sabre, Danse hongroise, Roi de la montagne |
| 2 | 👣 Démarches | Filature (Peter Gunn), Baby Elephant Walk, Dr. Dre |
| 3 | 🎤 Tubes pop, rock, rap | Strip-tease, Careless Whisper, Pretty Woman, All by Myself, Dancing Queen, I Feel Good |
| 3 | 🌤️ Douceur, sérénité | Réveil (Peer Gynt), Wonderful World |
| 4 | 🎻 Élégance classique | Bal viennois (Beau Danube bleu), Duo des fleurs |
| 4 | 🍹 Lounge, bossa nova | Bar lounge (Ipanema), Ascenseur, Soul Bossa Nova |
| 4 | 🎮 Jeux, télé, saloon | Qui veut gagner…, Mario, Tetris, Saloon (Maple Leaf Rag) |

Points ouverts :
- **Dr. Dre** sert pour une scène de banlieue ; sa place reste incertaine (dans Démarches : le caïd qui roule des mécaniques).
- **Soul Bossa Nova** est surtout connu comme thème d'Austin Powers : exception à la règle « hors film », à confirmer.
- **Noël** est en commentaire, à déplacer dans l'onglet Ambiances.

Les fichiers sont dans `public/sounds/musiques/` (≈ 62 Mo, 38 fichiers dont les 3 en commentaire). Ajoutés le 2026-11-08 : Dancing Queen (ABBA), I Feel Good (James Brown), Baby Elephant Walk (Mancini), Soul Bossa Nova (Quincy Jones). Leurs originaux sont dans `public/sounds/musiques/new_tmp/`, à supprimer avant le commit.

## 3. Fichiers coupés ou retouchés

Les autres fichiers sont entiers.

- **Toccata (Bach)** : de 0:00 à 1:08.
- **Danse des chevaliers (Prokofiev)** : les 105 premières secondes (la suite est un autre mouvement).
- **Duo des fleurs (Lakmé)** : de 1:04 à 2:28.
- **Bomb Run** : partie du milieu retirée (de 1:11.1 à 1:48.4), avec un fondu enchaîné de 1 s entre les deux parties ; 1:37 au lieu de 2:15.
- **Peer Gynt (Morning Mood)** : coupé à 3:58, la fin est retirée.
- **Dans l'antre du roi de la montagne (Grieg)** : début remonté (2026-11-08), le crescendo le rendait presque inaudible à la tuile (`start` 72,5 s, −35 LUFS). Gain de +12 dB jusqu'à 1:25, puis rampe jusqu'à 0 dB à 1:40 ; la fin est intacte. Le passage de la tuile est maintenant vers −24 LUFS, le crescendo reste audible. Réencodé depuis la version 80 kb/s (pas d'original gardé).

## 4. Retirés de la liste

Les ids restent réservés (liste en commentaire en tête de l'onglet dans la config) : Boléro (montée trop longue), Hallelujah et Canon de Pachelbel (à apprendre au piano), The Final Countdown, Don't Stop Me Now, Billie Jean, Looney Tunes, La Marseillaise, Vol du bourdon (déjà dans Kill Bill), Stayin' Alive, Remise de diplôme (Pomp and Circumstance).

Écartés plus tôt : Summertime, The Entertainer (à apprendre au piano), Happy, Halloween, et les musiques de film qui n'ont pas de place dans Films (Tubular Bells, Axel F, Misirlou, Gabriel's Oboe).
