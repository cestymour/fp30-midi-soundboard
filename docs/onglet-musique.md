# Onglet Musiques : état de la maquette

Document de travail (mis à jour le 2026-11-08). L'onglet est rempli dans `src/config/audio.config.ts` (id `musique`). C'est une **maquette** : l'organisation des familles, le visuel et les libellés sont un premier jet, à revoir (voir `docs/todo.md`). Avant de choisir ou présenter une musique, lire `docs/usage-scene.md`.

Règle : l'onglet Musiques ne reçoit que des **musiques cultes** (hors film), connues, qui habillent une scène d'impro en cours. Les musiques de film vont dans l'onglet Films. Pas de doublon avec Films : *Adagio for Strings* (Platoon) et le *Vol du bourdon* (Kill Bill) n'y sont pas.

## 1. Décisions

| Sujet | Décision |
|---|---|
| Disposition | Comme l'onglet Films : 4 colonnes, 2 familles par colonne, 2 tuiles par ligne dans une famille (`catCols: 2`). |
| Familles | Visibles (titre, emoji, couleur). Chaque tuile prend la couleur de sa famille (classe `musique-tuile`, variable `--cat-accent`). Les familles comiques et dramatiques ne se mélangent pas. |
| Tuile | Un emoji. En gros (`name`), ce qui identifie le mieux la musique pour le commun des gens : titre, artiste ou usage. En petit (`subtitle`), ce qu'elle fait entendre ou la situation. |
| Fichiers | Gardés entiers ; le moment marquant est réglé avec `start` / `end`. Une coupe ne se fait qu'à la demande, et c'est une coupe nette, sans fondu (les fondus sont gérés par l'appli). |
| Volume | Tous les fichiers de l'onglet sont à −18 LUFS, crête ≤ −1,5 dBTP (`ffmpeg`, `loudnorm` en deux passes). MP3 80 kb/s, 44,1 kHz stéréo, sans image de couverture. Seul `musique_ascenseur.mp3` est resté à 128 kb/s. |
| Lignes commentées | Une tuile en commentaire est mise de côté, pas supprimée : la ligne et son mp3 restent (Marche de Radetzky, We Are the Champions). |

## 2. Les familles (35 tuiles affichées)

| Colonne | Famille | Tuiles |
|---|---|---|
| 1 | 🔥 Épique, drame | O Fortuna, Zarathoustra, Toccata de Bach, Dies irae, Danse des chevaliers, Lacrimosa |
| 1 | 🪖 Guerre | Bombardier (Bomb Run), Walkyries, Vietnam (Fortunate Son) |
| 2 | 🏃 Poursuite, filature (comique) | Galop burlesque (Guillaume Tell), Filature (Peter Gunn), Roi de la montagne, Danse du sabre, Danse hongroise |
| 2 | 🤡 Cirque, fanfare (comique) | Entrée du cirque, French cancan *(Radetzky en commentaire)* |
| 3 | 💋 Amour et larmes | Careless Whisper, Strip-tease, All by Myself, Wonderful World, Duo des fleurs |
| 3 | 🏆 Victoire, frime | Dr. Dre, Pretty Woman *(We Are the Champions en commentaire)* |
| 4 | 📍 Lieux, moments (entendu sur place) | Ascenseur, Bar lounge (Ipanema), Saloon (Maple Leaf Rag), Bal viennois (Beau Danube bleu), Réveil (Peer Gynt), Noël (Jingle Bells) |
| 4 | 🎮 Jeux | Mario, Tetris, Qui veut gagner… |

Les fichiers sont dans `public/sounds/musiques/` (≈ 54 Mo, 34 fichiers dont les 2 en commentaire).

## 3. Fichiers coupés ou retouchés

Les autres fichiers sont entiers.

- **Toccata (Bach)** : de 0:00 à 1:08.
- **Danse des chevaliers (Prokofiev)** : les 105 premières secondes (la suite est un autre mouvement).
- **Duo des fleurs (Lakmé)** : de 1:04 à 2:28.
- **Bomb Run** : partie du milieu retirée (de 1:11.1 à 1:48.4), avec un fondu enchaîné de 1 s entre les deux parties ; 1:37 au lieu de 2:15.
- **Peer Gynt (Morning Mood)** : coupé à 3:58, la fin est retirée.

## 4. Retirés de la liste

Les ids restent réservés (liste en commentaire en tête de l'onglet dans la config) : Boléro (montée trop longue), Hallelujah et Canon de Pachelbel (à apprendre au piano), The Final Countdown, Don't Stop Me Now, Billie Jean, Looney Tunes, La Marseillaise, Vol du bourdon (déjà dans Kill Bill), Stayin' Alive, Remise de diplôme (Pomp and Circumstance).

Écartés plus tôt : Summertime, The Entertainer (à apprendre au piano), Happy, Halloween, et les musiques de film qui n'ont pas de place dans Films (Tubular Bells, Axel F, Misirlou, Gabriel's Oboe).
