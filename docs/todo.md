# À faire

Idées et évolutions demandées par l'utilisateur, pas encore planifiées. Les bugs ont leur propre journal (`docs/bugs.md`). Une idée réalisée sort de cette liste et passe dans `CHANGELOG.md`.

## Priorité : à faire avant tout le reste (dans cet ordre)

Demandé le 2026-11-10. Les points 1 et 2 passent avant tout ; les points 1 à 4 se font avant les autres sections de cette liste.

### 1. Sons et musiques : deux fonctionnements différents

Un son est court, une musique est longue.

- **Onglets « sons »** : Animaux, Bruits.
- **Onglets « musiques »** : Ambiances, Musiques, Films.

En résumé : **une seule piste commune aux trois onglets musiques, et une nouvelle piste à chaque clic sur un son.**

- [ ] **Onglets musiques** (comme aujourd'hui) :
  - une seule musique à la fois : lancer une musique dans Musiques coupe celle de Films (et inversement) ;
  - une seule barre de volume, commune aux trois onglets ;
  - les effets audio (popup Effets, Reset) ne s'appliquent qu'à la musique ;
  - pendant qu'une musique joue, un carré stop remplace l'image ou l'emoji de sa tuile (déjà le cas, à garder).
- [ ] **Onglets sons** :
  - pas d'effets : les boutons Effets et Reset ne sont pas affichés, et les effets audio ne s'appliquent pas aux sons ;
  - un son se superpose à tout le reste : il ne coupe pas la musique en cours (changement par rapport à aujourd'hui), ni un autre son ; deux sons différents lancés vite l'un après l'autre (même onglet ou non) s'entendent ensemble ;
  - pas de fondu, ni au début ni à la fin : un son part et s'arrête net (bouton ⏹, arrêt d'urgence, 9e son qui prend la place du plus ancien). L'option `noFade` n'a alors plus lieu d'être sur les sons : la retirer de leur config (elle reste possible pour les musiques) ;
  - pendant qu'un son joue, une icône remplace l'image ou l'emoji de sa tuile. Retenu : **choix 2, « repeat »** (double flèche) : un nouveau clic relance le son depuis le début **par-dessus** le premier, sans le couper (ex. : mitrailler l'appareil photo pour des paparazzis). Choix 1 (« restart » : le son repart du début) seulement si le choix 2 pose problème.
- [ ] **Déplacer Grillon et Cigale** d'Animaux vers Ambiances (trop longs, ils sonnent comme des ambiances). Ambiances a la place (26 tuiles sur 32). Garder leurs ids.
- [ ] **Arrêt d'urgence** : continue de tout couper (les 7 onglets : piano, musique et tous les sons en cours).

Faisabilité (vérifiée le 2026-11-10) : tout est faisable.
- Pour les sons, ne plus passer par `<audio>` mais décoder le fichier en `AudioBuffer` (lu depuis le cache hors ligne, donc ça marche sans réseau) et créer un `AudioBufferSourceNode` à chaque clic : départ quasi immédiat, superposition illimitée, `start` / `end` faciles à garder. Les sons vont dans un gain à part, branché après les effets (directement sur le limiteur, pour ne pas saturer quand ils s'empilent).
- Mémoire : un son décodé n'est plus compressé, il pèse environ 0,35 Mo par seconde en stéréo (10 Mo pour 30 s). Les sons sont courts (souvent quelques secondes, donc 1 à 3 Mo), mais tout décoder d'avance (Animaux + Bruits, environ 10 Mo de fichiers) prendrait plusieurs centaines de Mo sur une tablette ancienne.
- **Décodage au premier clic, rien d'avance** (retenu le 2026-11-10) : changer d'onglet ne charge rien. Le premier clic sur un son lit le fichier dans le cache et le décode avant de le jouer ; le délai devrait rester de l'ordre de celui d'aujourd'hui avec `<audio>`, qui doit lui aussi charger le fichier. Les clics suivants sur le même son partent tout de suite. Les sons décodés restent en mémoire dans la limite d'un budget (environ 50 Mo) : au-delà, on oublie ceux joués il y a le plus longtemps. À mesurer sur la tablette ; si le premier clic traîne, solution de repli : jouer ce premier clic par `<audio>` pendant que le décodage se fait à côté.
- **8 sons simultanés au plus** : le 9e prend la place du plus ancien en cours (coupé net, avec une rampe de quelques millisecondes pour éviter un claquement), pour que le nouveau son parte toujours.

Décidé le 2026-11-10 :
- **Deux volumes** : une barre commune aux 2 onglets sons, une barre commune aux 3 onglets musiques (ex. : une musique de fond douce, puis un bruit fort par-dessus). Chacune garde sa valeur.
- **Barre du haut des onglets sons**, réduite à trois éléments, tous propres aux sons sauf l'arrêt d'urgence :
  - un bouton ⏹ qui coupe tous les sons en cours, quel que soit l'onglet son d'où ils viennent (la musique continue) ; pas de pause, pas d'appui long ;
  - la barre de volume des sons, commune à Animaux et Bruits (passer de l'un à l'autre ne bouge pas le curseur) ;
  - le bouton d'arrêt d'urgence, commun à tous les onglets.

  En portrait, le bouton ⏹ se place à gauche du bouton d'arrêt d'urgence, sur la même ligne.

  Pas de barre de lecture (déplacer le curseur d'un son bref n'a pas de sens), pas de boutons Effets ni Reset. Dans les onglets musiques, la barre reste comme aujourd'hui (lecture, Effets, Reset, volume des musiques).
- **Une couleur par type d'onglet**, au lieu d'une par onglet : une pour les onglets MIDI, une pour les sons, une pour les musiques. La couleur dit ce que pilote la barre du haut (piano, sons ou musique). Aujourd'hui chaque onglet a son `accent` dans la config.
- **Progression sur la tuile** d'un son relancé plusieurs fois : elle suit le dernier lancé.
- `docs/usage-scene.md` et le README sont à mettre à jour.

### 2. Bouton « musique de transition »

Entre deux impros, il faut lancer tout de suite une musique rythmée pour remonter l'énergie du public. La même musique sert tout le spectacle, choisie avant le début parmi une dizaine.

Déroulé : avant le spectacle, on choisit la musique (liste déroulante ?). Au début, on la lance une trentaine de secondes, puis on l'arrête pour que le MC présente et lance la première impro. À la fin de l'impro, on la relance en un clic, idéalement là où on l'avait arrêtée ; on l'arrête quelques secondes plus tard, le MC introduit l'impro suivante, et ainsi de suite.

- [ ] Bouton toujours visible (dans l'en-tête, quel que soit l'onglet) ; pendant la lecture, une popup par-dessus les onglets montre la progression.
- [ ] Choix de la musique avant le spectacle, mémorisé (`localStorage`).
- [ ] Reprise là où on s'était arrêté (position mémorisée).
- [ ] Trouver la dizaine de musiques (fichiers à fournir).

Faisabilité : rien de bloquant. Retenu (2026-11-10) : c'est une musique comme les autres (elle coupe la musique des onglets musiques, et inversement : une seule musique à la fois), avec des fondus courts à la reprise et à l'arrêt, et la position mémorisée survit à un rechargement de l'appli en plein spectacle.

À définir pendant la réalisation :
- Fin du morceau : boucler au début, s'arrêter, ou enchaîner sur une autre musique de la liste ?
- La liste des morceaux à charger.
- Effets audio appliqués ou non ; volume des musiques ou à part.
- Où se fait le choix : popup À propos / réglages, ou dans la popup du bouton.

### 3. Réorganiser l'onglet Musiques

- [ ] Renommage, disposition de la grille, etc. Voir aussi « Musiques : finir la maquette » plus bas.

### 4. Ajouter quelques sons

- [ ] Épée qu'on dégaine, bruits d'épée divers (« Épées » existe déjà : `epee_contre_epee.mp3`). Attention : Bruits est plein (32 tuiles sur 32), il faut retirer des tuiles ou agrandir la grille.

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

- [ ] **Coder un looper.** C'est une très grosse fonctionnalité, qui ferait passer l'application en 2.0. Il serait peut-être dans une fenêtre accessible depuis l'onglet piano. À concevoir : ce qui est enregistré (notes MIDI du piano, ou son audio), comment on lance, superpose et arrête les boucles, et le calage sur un tempo.

## Thèmes (onglet à étudier)

- [ ] **Un onglet de thèmes**, avec des réglages bien plus complets qu'un instrument ou un preset. L'onglet liste les thèmes en tuiles (Asie, Arabie, Enfants…). Toucher une tuile ouvre un nouvel onglet propre au thème, avec ses instruments, ses réglages et ses indications de jeu. Exemples :
  - **Asie** : choisit l'instrument et le preset d'effets qui vont bien, et indique comment jouer (gamme pentatonique) ;
  - **Arabie** : met le sitar avec un preset adapté, et rappelle les notes de la gamme double harmonique ;
  - **Enfants** : plusieurs instruments au choix, chacun avec son preset.

  À concevoir : le format de configuration d'un thème (instrument : `pc` / `msb` / `lsb`, preset d'effets, texte d'aide, gamme) et la présentation des indications de jeu.
