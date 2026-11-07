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
- [ ] **Musiques cultes**, qui ne sont pas propres à un film (les musiques de film restent dans l'onglet Films). L'onglet Musiques existe depuis la 1.10.0 mais ne contient que la musique d'ascenseur : il manque les fichiers de *You Can Leave Your Hat On*, de Strauss *Ainsi parlait Zarathoustra* et de Carl Orff *O Fortuna*.
- [ ] **Poids des sons** : `public/sounds/` fait environ 150 Mo (films 95, ambiances 42, bruits 8, animaux 5). Tout part dans le cache hors ligne : voir si les ambiances (les plus lourdes) peuvent être allégées.

## Looper (version 2.0)

- [ ] **Coder un looper.** C'est une très grosse fonctionnalité, qui ferait passer l'application en 2.0. Il serait peut-être dans une fenêtre accessible depuis l'onglet piano. À concevoir : ce qui est enregistré (notes MIDI du piano, ou son audio), comment on lance, superpose et arrête les boucles, et le calage sur un tempo.

## Thèmes (onglet à étudier)

- [ ] **Un onglet de thèmes**, avec des réglages bien plus complets qu'un instrument ou un preset. L'onglet liste les thèmes en tuiles (Asie, Arabie, Enfants…). Toucher une tuile ouvre un nouvel onglet propre au thème, avec ses instruments, ses réglages et ses indications de jeu. Exemples :
  - **Asie** : choisit l'instrument et le preset d'effets qui vont bien, et indique comment jouer (gamme pentatonique) ;
  - **Arabie** : met le sitar avec un preset adapté, et rappelle les notes de la gamme double harmonique ;
  - **Enfants** : plusieurs instruments au choix, chacun avec son preset.

  À concevoir : le format de configuration d'un thème (instrument : `pc` / `msb` / `lsb`, preset d'effets, texte d'aide, gamme) et la présentation des indications de jeu.
