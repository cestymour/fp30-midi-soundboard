# À faire

Idées et évolutions demandées par l'utilisateur, pas encore planifiées. Les bugs ont leur propre journal (`docs/bugs.md`). Une idée réalisée sort de cette liste et passe dans `CHANGELOG.md`.

## Presets

- [ ] **Studio et Pluck se ressemblent beaucoup** (effets piano) : voir à l'oreille s'il faut garder les deux, ou un seul. Depuis la 1.9.0, Studio est un son sec et proche (Reverb 0, Cutoff 78, Attack 52, Release 38, Decay 56). Pluck : Reverb 2, Cutoff 85, Resonance 75, Attack 30, Release 35, Decay 40. Voir `src/config/midi-fx.config.ts`.

## Nouveaux onglets de sons (mp3)

Chaque onglet est une entrée de `AUDIO_TABS` (`src/config/audio.config.ts`), avec ses fichiers dans `public/sounds/<onglet>/`. Les ids suivent les règles du README (slug stable, unique). Penser au poids des fichiers : tout part dans le cache hors ligne (« Télécharger tous les sons »).

- [ ] **Bruits** : clavier d'ordinateur, etc.
- [ ] **Ambiances** : nature, ville, café, etc.
- [ ] **Musiques cultes**, qui ne sont pas propres à un film (les musiques de film restent dans l'onglet Films). Par exemple : *You Can Leave Your Hat On*, Strauss *Ainsi parlait Zarathoustra*, Carl Orff *O Fortuna*.

## Looper (version 2.0)

- [ ] **Coder un looper.** C'est une très grosse fonctionnalité, qui ferait passer l'application en 2.0. Il serait peut-être dans une fenêtre accessible depuis l'onglet piano. À concevoir : ce qui est enregistré (notes MIDI du piano, ou son audio), comment on lance, superpose et arrête les boucles, et le calage sur un tempo. Étude en cours : `docs/feature-loop-station.md`.

## Thèmes (onglet à étudier)

- [ ] **Un onglet de thèmes**, avec des réglages bien plus complets qu'un instrument ou un preset. L'onglet liste les thèmes en tuiles (Asie, Arabie, Enfants…). Toucher une tuile ouvre un nouvel onglet propre au thème, avec ses instruments, ses réglages et ses indications de jeu. Exemples :
  - **Asie** : choisit l'instrument et le preset d'effets qui vont bien, et indique comment jouer (gamme pentatonique) ;
  - **Arabie** : met le sitar avec un preset adapté, et rappelle les notes de la gamme double harmonique ;
  - **Enfants** : plusieurs instruments au choix, chacun avec son preset.

  À concevoir : le format de configuration d'un thème (instrument : `pc` / `msb` / `lsb`, preset d'effets, texte d'aide, gamme) et la présentation des indications de jeu.
