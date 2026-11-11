# À faire

Idées et évolutions demandées par l'utilisateur, pas encore planifiées. Les bugs ont leur propre journal (`docs/bugs.md`). Une idée réalisée sort de cette liste et passe dans `CHANGELOG.md`. Pour tout ce qui touche aux sons, voir aussi `docs/sons.md` et `docs/usage-scene.md`.

## Priorité (dans cet ordre, avant le reste de la liste)

### 1. Réorganiser l'onglet Musiques

L'organisation en 11 familles est arrêtée (2026-11-08) ; c'est encore une maquette. Reste à :

- [ ] revoir le visuel et les libellés (premier jet, pas définitif) ;
- [ ] trouver la bonne place de Dr. Dre (scène de banlieue ; aujourd'hui dans Démarches : le caïd qui roule des mécaniques) ;
- [ ] trancher pour Soul Bossa Nova : surtout connu comme thème d'Austin Powers, donc une exception à la règle « hors film » ;
- [ ] Mario et Tetris font peut-être doublon : en retirer un si la place manque.

### 2. Ajouter quelques sons

- [ ] Épée qu'on dégaine, bruits d'épée divers (« Épées » existe déjà : `epee_contre_epee.mp3`). Attention : Bruits est plein (32 tuiles sur 32), il faut retirer des tuiles ou agrandir la grille.

## Presets

- [ ] **Studio et Pluck se ressemblent beaucoup** (effets piano) : voir à l'oreille s'il faut garder les deux, ou un seul. Studio est un son sec et proche (Reverb 0, Cutoff 78, Attack 52, Release 38, Decay 56). Pluck : Reverb 2, Cutoff 85, Resonance 75, Attack 30, Release 35, Decay 40. Voir `src/config/midi-fx.config.ts`.
- [ ] **Réverbération des presets piano** : les valeurs d'Ambiance (0 à 10) ont été converties depuis les anciennes valeurs CC91 (0 à 127), sans être réglées à l'oreille.

## Nouveaux onglets de sons et fichiers

Chaque onglet est une entrée de `AUDIO_TABS` (`src/config/audio.config.ts`), avec ses fichiers dans `public/sounds/<onglet>/`. Règles de nommage, de traitement et de poids : `docs/sons.md`.

- [ ] **Bruits** (32 tuiles sur 32 : pour en ajouter, il faut en retirer ; la perceuse est en commentaire dans la config). Idées pas encore reprises :
  - Maison : toc-toc à la porte, clés / serrure, chasse d'eau, robinet, réveil, tic-tac d'horloge / coucou, aspirateur, sèche-cheveux.
  - Bureau : imprimante / photocopieuse, caisse enregistreuse, ascenseur « ding ».
  - Action : verre brisé, gifle, fouet, chute / glissade, marteau.
  - Transports : sifflet de train ou d'arbitre.
  - Gags : prout, rot, boing / ressort, course de dessin animé, rire de sitcom, « ta-dam » de fanfare, cri de Wilhelm.
  - Corps : éternuement, toux, ronflement, bâillement, huées du public, sifflement de drague, baiser.
  - Fête : bouchon de champagne, canette qu'on ouvre, gorgée.
- [ ] **Animaux** (32 sons sur 32 places : même contrainte). Sons connus qui manquent : oie, perroquet, phoque / otarie, souris / rat, hippopotame, poussin, pie / geai. Un cheval au galop existe en fichier (`animaux/cheval_galop.ogg`, ligne commentée), mais le MIDI a déjà un « Galop cheval ».
- [ ] **Onglet Voyage (régions du monde).** Des clichés de pays, courts (quelques secondes), entendus ou non par les personnages, pour une scène qui se passe dans un pays. Ils tiennent surtout au timbre, que le piano ne rend pas : cornemuse (Écosse), sitar (Inde), mariachis (Mexique), accordéon musette (Paris), bouzouki / sirtaki (Grèce), koto (Japon), didgeridoo (Australie), steel drum (Caraïbes), balalaïka (Russie), flûte de Pan (Andes), oud (Orient), yodel (Alpes)… Les styles qui se jouent bien au piano (tango, ragtime, valse, boogie) restent au piano. Même modèle que l'onglet Musiques : familles par continent, une couleur par famille.
- [ ] **Poids des sons** : Films (environ 94 Mo) et Animaux ne sont pas encore réencodés.
- [ ] **Niveler le volume de Films et Animaux** (commit à part), comme Bruits, Ambiances et Musiques (méthode dans `docs/sons.md`).
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

## Dette technique

Repris de la dernière revue de code (version 1.8.0, 2026-11-05) : ce qui n'a pas été traité. Rien de bloquant.

- [ ] **Parseur BLE** (`src/midi/ble-midi-parser.ts`) : il ne sert plus qu'au journal `MIDI IN (BT)` de la console. Gardé pour le diagnostic ; à retirer si ce journal ne sert jamais.
- [ ] **Volume des musiques appliqué deux fois : à décider.** Le curseur des musiques règle le gain général du graphe **et** le volume de l'élément `<audio>` de la piste (`setMasterVolume`, setter `volume` de `MediaElementTrack`). Mesuré dans Chrome (2026-11-11) : Chrome applique bien le volume de l'élément avant le graphe, donc le gain effectif est v² : à 50 % sur le curseur, −12 dB au lieu de −6 dB. C'est le rendu actuel, auquel l'oreille est habituée (une courbe au carré est d'ailleurs plus proche de la perception qu'une courbe linéaire). Ne garder qu'une commande changerait la sensation du curseur : si on le fait, écrire la courbe au carré explicitement sur le seul gain général, pour garder le même rendu.
- [ ] **TypeScript 7** : `svelte-check` ne l'accepte pas encore (TypeScript 5 ou 6). Le projet reste en 5.9 ; à reprendre quand `svelte-check` suivra.
- [ ] **Alertes `npm audit` restantes** (deepmerge, glob, minimatch, modérées ou faibles) : dans Workbox, tiré par `vite-plugin-pwa`, utilisé seulement à la build ; rien ne part dans l'application publiée. La correction proposée (`npm audit fix --force`) rétrograderait `vite-plugin-pwa` : à reprendre quand Workbox sera mis à jour.
- [ ] **Vérifications sur la tablette jamais notées comme faites** (corrections de la 1.8.0 et de la 1.9.0, vérifiées seulement sur le PC) : en Bluetooth, plus de note tenue avec un orgue ; le piano retrouvé sous son nom après un rechargement (`getDevices`) ; pas de grésillement avec un son fort, volume à 100 %, réverbération et basses à fond ; une longue série de sons, chacun démarre ; dans un onglet Chrome, la dernière rangée de boutons visible. Ces points sont dans `docs/checklist.md` : à cocher ici une fois vus.
