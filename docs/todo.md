# À faire

Idées et évolutions demandées par l'utilisateur, pas encore planifiées. Les bugs ont leur propre journal (`docs/bugs.md`). Une idée réalisée sort de cette liste et passe dans `CHANGELOG.md`.

## Presets

- [ ] **Studio et Pluck se ressemblent beaucoup** (effets piano) : voir à l'oreille s'il faut garder les deux, ou un seul. Depuis la 1.9.0, Studio est un son sec et proche (Reverb 0, Cutoff 78, Attack 52, Release 38, Decay 56). Pluck : Reverb 2, Cutoff 85, Resonance 75, Attack 30, Release 35, Decay 40. Voir `src/config/midi-fx.config.ts`.

## Nouveaux onglets de sons (mp3)

Chaque onglet est une entrée de `AUDIO_TABS` (`src/config/audio.config.ts`), avec ses fichiers dans `public/sounds/<onglet>/`. Les ids suivent les règles du README (slug stable, unique). Penser au poids des fichiers : tout part dans le cache hors ligne (« Télécharger tous les sons »).

- [ ] **Compléter l'onglet Bruits** (32 boutons sur 32 places depuis la 1.10.0 : pour en ajouter, il faut en retirer ; la perceuse est déjà en commentaire dans la config). Idées de bruitages pas encore reprises (sans doublon avec les sons MIDI : le piano a déjà rire, cri, pas, applaudissements, téléphones, porte qui grince ou claque, voiture, sirène, train, avion, laser, coup de feu, coup de poing, explosion, pluie, tonnerre, vent, chien, galop…) :
  - Maison : toc-toc à la porte, clés / serrure, chasse d'eau, robinet, réveil, tic-tac d'horloge / coucou, aspirateur, sèche-cheveux.
  - Bureau : imprimante / photocopieuse, caisse enregistreuse, ascenseur « ding ».
  - Action : verre brisé, gifle, fouet, chute / glissade, marteau.
  - Transports : sifflet de train ou d'arbitre.
  - Gags : prout, rot, boing / ressort, course de dessin animé, rire de sitcom, « ta-dam » de fanfare, cri de Wilhelm.
  - Corps : éternuement, toux, ronflement, bâillement, huées du public, sifflement de drague, baiser.
  - Fête : bouchon de champagne, canette qu'on ouvre, gorgée.
- [ ] **Compléter l'onglet Animaux** : sons connus qui manquent dans l'onglet (pour remplir les cases libres si des sons passent dans Ambiances) : oie, perroquet, phoque / otarie, souris / rat, hippopotame, poussin, pie / geai. Un cheval au galop existe déjà en fichier (`animaux/cheval_galop.ogg`, ligne commentée) mais le MIDI a un « Galop cheval ».
- [ ] **Bruitages sans fondu d'entrée** : l'option `noFade: true` existe (mise sur `sonnette-porte`). La passer sur les autres bruitages qui démarrent net, après essai à l'oreille (roulement de tambour, buzzers, ba-dum-tss, verre brisé…).
- [ ] **Musiques : finir la maquette** (état actuel dans `docs/onglet-musique.md`). L'organisation en 11 familles est arrêtée (2026-11-08). Reste à :
  - trouver la bonne place de Dr. Dre (scène de banlieue), et trancher pour Soul Bossa Nova (thème d'Austin Powers, donc musique de film) ;
  - déplacer Noël (en commentaire dans Musiques) dans l'onglet Ambiances ;
  - revoir le visuel et les libellés (premier jet, pas définitif) ;
  - Mario et Tetris font peut-être doublon : en retirer un si la place manque.
- [ ] **Onglet Voyage (régions du monde).** Des clichés de pays, courts (quelques secondes), entendus ou non par les personnages, pour une scène qui se passe dans un pays. Ils tiennent surtout au timbre, que le piano ne rend pas : cornemuse (Écosse), sitar (Inde), mariachis (Mexique), accordéon musette (Paris), bouzouki / sirtaki (Grèce), koto (Japon), didgeridoo (Australie), steel drum (Caraïbes), balalaïka (Russie), flûte de Pan (Andes), oud (Orient), yodel (Alpes)… Les styles qui se jouent bien au piano (tango, ragtime, valse, boogie) restent au piano. Même modèle que l'onglet Musiques : familles par continent, une couleur par famille.
- [ ] **Poids des sons** : tout part dans le cache hors ligne. Bruits, Ambiances et Musiques sont faits (128 kb/s stéréo ou 64 kb/s mono, 80 kb/s pour les musiques). Reste à voir : les films (environ 94 Mo) et les animaux.
- [ ] **Niveler le volume des autres onglets** (commit à part de celui des nouveaux onglets). Bruits (−18 LUFS), Ambiances (−24 LUFS) et Musiques (−18 LUFS) sont nivelés depuis le 2026-11-07. À faire de la même façon pour **Films** et **Animaux** : mesurer (`ffmpeg`, filtre `ebur128`), puis gain simple avec limiteur seulement sur les crêtes qui saturent (6 dB au plus). Les fichiers aux crêtes trop denses restent sous la cible (voir les sons plafonnés ci-dessous). Script : gain → mesure → on garde seulement si le niveau se rapproche de la cible.
- [ ] **Sons restés sous la cible** après le nivellement du 2026-11-07, crêtes trop nombreuses pour les monter sans les écraser. À juger à l'écoute, ou à monter avec un compresseur si on accepte de changer leur caractère : Ambiances : Feu de cheminée (−28,8 au lieu de −24), Feux d'artifice (−25,8), Grotte (−25,2), Pluie et tonnerre (−25,0). Bruits : Prend feu (−28,9 au lieu de −18), Machine à écrire (−27,9), Tic-tac bombe (−24,9), Clavier d'ordinateur (−20,0), Roulement de tambour (−20,0).

## À apprendre au piano

Morceaux écartés de l'onglet Musiques parce qu'ils se jouent au clavier plutôt qu'avec un fichier :

- [ ] Gymnopédie n° 1 (Satie) : vide, introspection, douceur triste.
- [ ] Clair de lune (Debussy) : nuit, romantisme, contemplation.
- [ ] Marche funèbre (Sonate n° 2, Chopin) : enterrement.
- [ ] Canon en ré (Pachelbel) : mariage, émotion douce.
- [ ] Le Beau Danube bleu (Johann Strauss II), version piano.
- [ ] The Entertainer (Scott Joplin).
- [ ] Hallelujah (Leonard Cohen).
- [ ] Tubular Bells (Oldfield).
- [ ] Marche nuptiale de Wagner (entrée de mariage) et de Mendelssohn (sortie de mariage).

## Looper (version 2.0)

- [ ] **Coder un looper.** C'est une très grosse fonctionnalité, qui ferait passer l'application en 2.0. Il serait peut-être dans une fenêtre accessible depuis l'onglet piano. À concevoir : ce qui est enregistré (notes MIDI du piano, ou son audio), comment on lance, superpose et arrête les boucles, et le calage sur un tempo. Étude en cours : `docs/feature-loop-station.md`.

## Thèmes (onglet à étudier)

- [ ] **Un onglet de thèmes**, avec des réglages bien plus complets qu'un instrument ou un preset. L'onglet liste les thèmes en tuiles (Asie, Arabie, Enfants…). Toucher une tuile ouvre un nouvel onglet propre au thème, avec ses instruments, ses réglages et ses indications de jeu. Exemples :
  - **Asie** : choisit l'instrument et le preset d'effets qui vont bien, et indique comment jouer (gamme pentatonique) ;
  - **Arabie** : met le sitar avec un preset adapté, et rappelle les notes de la gamme double harmonique ;
  - **Enfants** : plusieurs instruments au choix, chacun avec son preset.

  À concevoir : le format de configuration d'un thème (instrument : `pc` / `msb` / `lsb`, preset d'effets, texte d'aide, gamme) et la présentation des indications de jeu.
