# Historique des versions

La version la plus récente en haut. Les versions antérieures à la 1.8.0 ne sont décrites que par l'historique git.

## Prochaine version (non publiée)

### Corrections

- **Textes plus lisibles de loin.** Titres de catégorie en 14 px gras au lieu de petites capitales de 9 px. Musiques : noms et sous-titres plus grands, sous-titres plus contrastés ; en portrait, le texte a la même taille dans tous les blocs (Épique et Cirque en haut comme Tubes et Élégance en bas). Films : légendes plus grandes, elles prennent la bande vide au-dessus et au-dessous de l'affiche.
- **Piano non connecté bien visible** : le badge « ⚠ Non connecté » est plein et orange ; les erreurs Bluetooth (BT perdu, Bluetooth refusé…) sont pleines et rouges.
- **Films** : « Ambiance tendue » (Saw) au lieu de « tendu ».

### À vérifier sur la tablette

- Musiques et Films dans les deux orientations : aucun texte coupé ni débordant, emojis toujours lisibles dans les tuiles du haut en portrait.
- Onglets piano sans connexion : le badge orange se voit d'un coup d'œil sans gêner la liste de connexion.

## 1.17.0 — 2026-11-13

### Nouveautés

- **Des dessins à la place de certains emojis.** Les emojis justes restent ; une tuile reçoit un dessin quand son emoji avait été pris faute de mieux (un dodo pour la mouette, une scie de menuisier pour la tronçonneuse), quand des tuiles différentes partageaient le même (trois pistolets à eau), ou quand l'emoji s'affichait en carré vide sur la tablette (flûte, âne, harpe glissando). Les dessins ont le niveau de détail d'un emoji, en vraies couleurs, et sont intégrés à l'application (disponibles hors ligne).
  - **Instruments** : Rhodes (télé rétro), Voix jazz (micro rétro), Cloches tubulaires, Orgue jazz, Basse (basse électrique), Harmonica, Xylophone, Grosse caisse, Cuivres (trompette de héraut), Guitare (guitare classique), Laser / Synth, Piano électrique (planète à anneau), Flûte, Flûte de Pan, Saxo soprano (saxo droit), Harpe glissando, Chœur.
  - **Sons MIDI** : Ruisseau, Pas (traces de chaussures), Bloc de bois, Cloche de vache, Grincement porte (porte entrouverte), Claque ! (porte qui tremble), Pistolet laser, Coup de feu (revolver), Mitraillette.
  - **Animaux** : Pigeon, Hyène, Âne, Chat : Ronron (chat en boule), Mouette, Moustique.
  - **Bruits** : Verre d'eau, Machine à café, Machine à écrire, Erreur Windows, Tronçonneuse, Briquet, Ba-dum-tss, Scie à métaux.
  - **Ambiances** : Cigales, Vagues et mouettes, Grotte, Feu de cheminée (cheminée de salon), Champ de bataille, Stade (stade de foot), Discussions dehors et dedans (bulles de dialogue), Maternité (bébé qui pleure), Manifestation.
  - **Onglets** : une patte pour Animaux, une double croche pour Musiques.
- **Animaux** : la tuile « Abeille » devient **« Moustique »** (le son est un moustique). Chats et chiens en rouge, pour les distinguer de la forêt ; Grillons passe avant Moustique.
- **Ambiances : 8 nouvelles ambiances** : Métro, Train, Stade, Concert, Fête foraine, Sous l'eau, Jungle, Champ de bataille. Café, Restaurant et Salle d'arcade sont retirés de la grille (fichiers gardés).
- **Bruits et Ambiances : tuiles en blocs de couleur par thème**, rangées pour que les voisines se ressemblent (Bruits : maison, bureau et informatique, téléphone, rue et cérémonies, spectacle et jeux, danger et outils ; Ambiances : nature, ville et transports, foules et fêtes, mer, éléments, nuit et peur, voix).

### Corrections

- **Popups des effets** : le bouton ↺ de chaque curseur est maintenant au-dessus du curseur, sur tous les écrans. Il était à droite du nom, et sur un téléphone en portrait un nom long (Resonance) le poussait hors de la carte.

### À savoir

- Sur la tablette, l'emoji de la **Harpe** (à côté du piano) reste un carré vide : elle garde son emoji pour l'instant. Les **Épées** (⚔️) aussi sont à revoir.

### À vérifier sur la tablette

- Chaque dessin s'affiche (pas de carré vide), à la taille des emojis voisins, bien visible sur le fond sombre, en paysage et en portrait.
- Pendant la lecture, le dessin d'une tuile de musique laisse la place au carré stop, et celui d'une tuile de son à la double flèche, comme un emoji.
- Hors ligne (mode avion), les dessins s'affichent toujours.

## 1.16.0 — 2026-11-12

### Nouveautés

- **Les onglets ne défilent plus.** Quand les libellés ne tiennent plus en largeur (petit écran, téléphone), la barre resserre d'abord les marges, puis n'affiche plus que les emoji. Tous les onglets restent visibles : un seul appui suffit pour changer d'onglet.
- **L'onglet actif se voit bien mieux** : il est teinté de la couleur de son type (violet pour le piano, vert pour les sons, jaune pour les musiques), son nom est écrit dans cette couleur, et la barre lumineuse dessous est plus épaisse.
- **Boutons des coins redessinés.** La musique de transition et les paramètres sont maintenant des ronds de couleur, orange avec ♫ à gauche, bleu avec un engrenage à droite, pour ne plus les confondre avec les onglets. Tout le carré du coin reste sensible au toucher, pas seulement le rond. Popup ouverte, ♫ devient ▶, puis ■ pendant la lecture, tous deux orange.
- **Popup de la musique de transition :**
  - le **carré stop du coin** arrête la musique **et ferme la popup** ; le bouton « Arrêter » de la popup, lui, la laisse ouverte ;
  - tout le fond est **inactif** pendant que la popup est ouverte, barre d'onglets comprise, sauf le bouton du coin (▶ / ■). Un appui n'importe où à côté la ferme, sans changer d'onglet ;
  - sur un **téléphone en paysage**, elle tient sans défilement ;
  - son titre est en grand, comme celui des paramètres.
- La popup Paramètres a un cadre bleu, comme le cadre orange de la popup de transition.
- Emoji des onglets un peu plus grands. 🐮 pour Animaux (les traces de pas s'affichaient en noir, invisibles sur le fond sombre), 🎼 pour Musiques.

### À vérifier sur la tablette

- La barre d'onglets en paysage et en portrait : aucun défilement, onglet actif bien visible, libellés présents si la place le permet.
- L'engrenage et ♫ s'affichent bien dans leur rond, en une seule couleur (pas en emoji ni en carré vide).
- Un appui au bord du carré d'un coin, hors du rond, ouvre bien sa popup.
- Musique de transition : ♫, puis ▶ (la musique part), puis ■ : la musique s'arrête en fondu et la popup se ferme. Popup ouverte, un appui sur un onglet ferme la popup sans changer d'onglet.

## 1.15.0 — 2026-11-11

### Nouveautés

- **Popup Paramètres (⚙) réorganisée.** Elle est rangée par ordre d'importance, tout en français :
  - **Écran** : le bouton **Plein écran** en premier, grand et en couleur, puis « Écran toujours allumé » (oui / non).
  - **Hors ligne** : nombre de sons et d'images disponibles hors ligne, stockage protégé, Service Worker, et « ⬇ Télécharger tous les sons » tant qu'il manque des fichiers.
  - **Application** : version et « ⟳ Mettre à jour l'application ».
  - Chaque état a une pastille : verte quand c'est prêt, orange quand c'est à vérifier avant un spectacle, grise quand l'appareil ne le permet pas.
  - Elle se ferme par la croix ✕ en haut à droite, comme la popup de la musique de transition, ou par un appui à côté. Le bouton « Fermer » du bas disparaît.
- **Petits écrans (téléphone) : la grille défile.** Quand les tuiles ne tiennent pas en hauteur, la grille se fait défiler au doigt au lieu de couper la dernière rangée (onglets d'instruments, Musiques, Films). La barre d'onglets et la barre de contrôles (volume, arrêt d'urgence…) restent en place. Sur la tablette, où tout tient, rien ne change : pas de défilement.
- **Musiques** : Strip-tease a l'icône 👯‍♀️.

### Corrections

- **Les anciennes versions des sons sont effacées** (bug n° 27). Chaque fois qu'un son ou une affiche était renommé ou retiré, l'ancien fichier restait pour toujours dans la mémoire de la tablette (jusqu'à environ 180 Mo perdus). « Télécharger tous les sons » efface maintenant ce qui ne sert plus, une fois tout le reste téléchargé, et dit la place libérée. S'il ne manque rien mais qu'il reste d'anciens fichiers, le bouton devient « ♻ Libérer la place des anciens fichiers ».
- **Un son remplacé sous le même nom est mis à jour sur la tablette** (bug n° 14). Chaque son et chaque affiche porte maintenant une empreinte de son contenu dans son adresse : un fichier modifié change d'adresse, et la tablette le télécharge à nouveau. Plus besoin de renommer un son modifié (`_v2`).

### À savoir

- **Au premier lancement de cette version, tous les sons comptent comme manquants** (le compteur hors ligne repart de 0) : leurs adresses ont toutes changé. Faire « ⬇ Télécharger tous les sons » **en wifi** (environ 195 Mo), puis la place des anciennes copies est libérée. En attendant, hors ligne, les sons déjà téléchargés jouent toujours : l'ancienne copie est utilisée à la place de la nouvelle.
- Si un téléchargement échoue (réseau coupé), rien n'est effacé : relancer « Télécharger tous les sons » plus tard.

### À vérifier sur la tablette

- Après la mise à jour, en mode avion **avant** de retélécharger : une musique et un son déjà joués se lancent encore. Puis, en wifi, « ⬇ Télécharger tous les sons » : le compteur arrive au total et le message donne la place libérée.
- Ouvrir ⚙ dans l'application installée : toutes les pastilles doivent être vertes avant un spectacle.
- « Plein écran » dans un onglet Chrome, puis « Quitter le plein écran ».
- Dans les deux orientations, aucun onglet ne doit défiler. Sur un téléphone en portrait, l'onglet Instruments défile, et un glissement qui part d'une tuile ne la déclenche pas.

## 1.14.0 — 2026-11-11

### Nouveautés

- **Films et Animaux au même volume que le reste.** Jusqu'ici, un thème de film pouvait sonner 20 dB plus fort qu'un autre (Taxi contre Les Chariots de feu), et pareil pour les animaux (le lion contre le grillon). Ils sont maintenant tous au niveau des onglets Musiques et Bruits, mesuré sur le passage qui joue vraiment (à partir du moment de départ de la tuile). Le curseur de volume n'a plus à être rattrapé d'une tuile à l'autre.
- **Fichiers plus légers** : les films passent de 94 à 76 Mo, les animaux de 5,5 à 3,2 Mo (même encodage que l'onglet Musiques).
- **Moins de calcul pour la tablette** : la réverbération et l'écho des effets audio ne tournent plus quand ils sont coupés, et deux traitements inutilisés (compresseur, distorsion) sont retirés. Le son ne change pas (mesuré : 0,07 dB, inaudible).

### À savoir

- **Après la mise à jour, utiliser « Télécharger tous les sons »** (popup À propos) : les films et les animaux ont de nouveaux fichiers (environ 80 Mo à télécharger). Sinon, ils se chargent au premier clic. Les anciens fichiers restent dans le cache de Chrome (bug n° 27 de `docs/bugs.md`, à corriger plus tard).
- Quatre sons restent un peu moins forts que les autres, pour ne pas les écraser : Harry Potter, Dirty Dancing, Ronronnement, et le cheval au galop (tuile en commentaire).
- Pour les développeurs : fins de ligne en LF partout, Vite 8 (cible gardée pour Chrome 106, vérifiée sur un Chromium 106), outil de non-régression sous Windows (`npm run regression`), code mort retiré.

### À vérifier sur la tablette

- Quelques films (Taxi, Titanic, Les Chariots de feu, Star Wars) et quelques animaux (lion, grillon, cheval) : volume semblable d'une tuile à l'autre, et chaque tuile démarre au bon moment.
- Effets audio sur une musique : un preset avec réverbération ou écho (Église, Cave) s'entend, puis Reset le coupe.
- Hors ligne, après « Télécharger tous les sons » : un film et un animal se lancent.

## 1.13.0 — 2026-11-11

### Nouveautés

- **Musique de transition**, pour relancer l'énergie du public entre deux impros. Le bouton 🎉, dans le coin en haut à gauche (en face du bouton Paramètres), est visible depuis tous les onglets. Il **ouvre une popup** ; un clic raté sur l'en-tête pendant une impro ne lance donc rien. Popup ouverte, le bouton 🎉 devient un **bouton play** : un double clic sur l'en-tête ouvre la popup et lance la musique. Pendant la lecture, il devient un **carré stop**, avec la progression en fond. Ce carré, comme le gros bouton « Arrêter » de la popup, arrête la musique (court fondu) ; la popup reste ouverte (✕ ou un toucher à côté la ferme). Elle garde toujours la même taille.
- **Plusieurs moments marquants par musique**, pour ne pas rejouer cinq fois de suite la même transition. Le moment **0** ouvre le spectacle ; les moments **1, 2, 3…** servent après chaque impro, à tour de rôle : 0, 1, 2, 3, 1, 2, 3, 1… La popup les montre sur une ligne de boutons, avec leur position dans la musique. Le **moment prévu** est en couleur et plus large, pour être touché sans viser : c'est lui que lance le bouton de l'en-tête. Les autres restent cliquables ; après un moment joué hors de l'ordre, le prévu devient son suivant. On revient au 0 en changeant de musique, ou au-delà de 6 heures sans lancement (le spectacle suivant) ; un rechargement de l'appli en plein spectacle ne change rien.
- **Lancer la musique de transition coupe tout**, comme l'arrêt d'urgence : la musique des onglets, les sons en cours et le piano.
- **Une seule musique pour tout le spectacle**, choisie avant le début dans la popup, et gardée d'une fois sur l'autre. Onze musiques, triées par auteur : Benny Goodman (Sing, Sing, Sing), Boney M. (Rasputin), C2C (Down the Road), Caravan Palace (Beatophone, Lone Digger), Fatboy Slim (The Rockafeller Skank), Kungs vs Cookin' on 3 Burners (This Girl), Parov Stelar (All Night, The Mojo Radio Gang, Booty Swing, Catgroove). Chacune a son moment 0 et de 2 à 4 moments marquants, réglés dans `src/config/transition.config.ts`.
- **Interrupteur « Volume remis à 100 % à chaque ouverture »**, sous le curseur de volume de la popup. Activé, le volume de la transition repasse à 100 % chaque fois que la popup s'ouvre ; désactivé (par défaut), il reste comme avant. Le réglage est gardé.
- **Sans les effets des musiques, avec son propre volume** (curseur dans la popup, gardé lui aussi). Une musique lancée depuis un onglet coupe la musique de transition ; l'arrêt d'urgence aussi.
- **Bouton « ✨ Clarté Studio »** dans la popup, à côté de l'interrupteur du volume : il applique à la musique de transition le préréglage Clarté Studio des effets audio (graves +4 dB, médiums −2 dB, aigus +6 dB, coupe-bas à 30 Hz, un peu de réverbération), tout de suite, même en lecture. Un second appui le retire. L'arrêt coupe aussi la réverbération, comme pour une musique des onglets. Il ne touche pas aux effets des onglets musiques, et reste allumé d'une fois sur l'autre.

### À savoir

- Les moments se règlent dans `src/config/transition.config.ts` : `start` pour le 0, `restarts` pour les suivants (par exemple `restarts: [50, 80, 110]` donne les moments 1, 2 et 3).
- Les traits des moments (0, 1, 2…) sont visibles sur la barre même à l'arrêt. La barre de progression et le temps affiché dans la popup comptent depuis le début du fichier (0:00), pas depuis le moment 0 : au moment 1 de All Night, le temps affiche 0:50, comme sur le bouton du moment.
- Un clic sur ▶ ou ■ dans l'en-tête qui suit de moins de 0,6 s le précédent est ignoré : un double clic ne lance pas la musique pour l'arrêter aussitôt.
- En portrait, les onglets sont un peu plus serrés pour que tout tienne avec le nouveau bouton.
- Onze nouveaux fichiers, nommés « auteur_titre.mp3 », dans `public/sounds/transitions/` : « Télécharger tous les sons » les ajoute au hors ligne. Comme les musiques des onglets, ils sont nivelés à −18 LUFS (crête ≤ −1,5 dBTP) et encodés en MP3 80 kb/s stéréo sans pochette ni image : 25,7 Mo au total au lieu de 62 Mo. Les originaux étaient très forts (de −7 à −12 LUFS, crêtes souvent au-dessus de 0 dBFS) : ils sont donc baissés de 6 à 11 dB, et le volume de la transition reste réglable dans la popup.

### À vérifier sur la tablette

- Le bouton 🎉 en paysage et en portrait : tous les onglets restent visibles.
- Un clic sur 🎉 ouvre la popup sans rien lancer ; un double clic la lance ; un bouton de moment la lance et coupe ce qui jouait (musique, sons, notes tenues au piano) ; le carré stop de l'en-tête et « Arrêter » l'arrêtent sans fermer la popup, qui ne change pas de taille.
- L'ordre des moments : 0, puis 1, 2… à tour de rôle ; le bouton en couleur est bien celui que lance le double clic.
- L'interrupteur du volume : activé, rouvrir la popup remet le curseur à 100 % ; désactivé, le volume ne bouge pas.
- Le volume de la transition ne change pas celui des musiques, et les effets audio des onglets ne s'y appliquent pas.
- « Clarté Studio » : allumé, le son de la transition change aussitôt (plus brillant, un peu de réverbération), sans clic ; éteint, il redevient brut ; les effets des onglets musiques ne bougent pas.
- Recharger l'appli après un lancement : la musique choisie et le moment prévu sont gardés.
- Hors ligne, après « Télécharger tous les sons » : les onze musiques de transition se lancent.

## 1.12.0 — 2026-11-10

### Nouveautés

- **Barre de contrôles réorganisée.** Effets et Reset passent à la fin de la moitié gauche, le volume gagne leur place, et le bouton stop est toujours à droite du volume. Peu de place : icônes seules (les libellés courts FX et RAZ disparaissent). En portrait, deux lignes (transport et effets, puis volume et stop) ; les onglets sons tiennent sur une seule ligne. Dans les onglets sons, sous 600 px de large, les boutons n'ont plus de texte, quelle que soit l'orientation.
- **Animaux : 32 sons sur 32 places.** Les Grillons reviennent dans Animaux, et une nouvelle tuile **Mouette : Kriaa** y prend place. La grille est pleine.
- **Ambiances.** Nouvelle tuile **Noël** (Jingle Bells). Les Cigales restent dans Ambiances ; la tuile « Mouettes » n'y est plus (elle est dans Animaux ; « Vagues et mouettes » reste). La Grotte passe dans le groupe « Mer et nature ».
- **Débuts et fins de sons ajustés** d'après la mesure des silences (Animaux et Bruits) : moins de blanc avant et après les sons.

### À savoir

- **Fichiers renommés.** Les noms des 36 films et de 6 bruits ont changé (plus d'espaces, de parenthèses ni d'accents). Après la mise à jour, utiliser « Télécharger tous les sons » dans « À propos » (environ 100 Mo) pour les avoir hors ligne ; sinon ils se chargent au premier clic. Les anciens fichiers restent dans le cache de Chrome jusqu'à ce qu'il le nettoie.
- Pour les développeurs : les `id` des tuiles ne changent pas, seuls les chemins `file:` ; les lignes commentées dont le mp3 n'existe plus sont supprimées (leurs `id` restent dans l'historique git, à ne pas réutiliser) ; les colonnes de `audio.config.ts` sont réalignées.

### À vérifier sur la tablette

- La barre de contrôles en paysage et en portrait, sur les onglets musiques, sons et piano (Chrome 106) : Effets, Reset, volume et stop bien placés, rien ne déborde.
- Une tuile de chaque onglet renommé : un film (par exemple Star Wars) et un bruit (par exemple le Clavier), y compris en mode avion après « Télécharger tous les sons ».
- Les tuiles déplacées : Grillons et Mouette dans Animaux, Noël et Cigales dans Ambiances.
- Quelques sons dont le début ou la fin ont changé : pas de coupure trop tôt.

## 1.11.0 — 2026-11-10

### Nouveautés

- **Sons et musiques fonctionnent différemment.** Un son est court, une musique est longue :
  - **Onglets sons (Animaux, Bruits)** : un son se superpose à tout le reste. Il ne coupe plus la musique en cours, ni un autre son : deux sons lancés vite l'un après l'autre, du même onglet ou non, s'entendent ensemble (jusqu'à 8 à la fois ; un 9e prend la place du plus ancien). Un nouveau clic sur un son en cours le relance depuis le début **par-dessus** le premier, sans le couper (mitrailler l'appareil photo pour des paparazzis) ; pendant qu'il joue, une double flèche remplace son emoji, et la barre de progression de la tuile suit le dernier lancé. Un son part et s'arrête net, sans fondu, et les effets audio ne s'y appliquent pas.
  - **Onglets musiques (Ambiances, Musiques, Films)** : comme avant, une seule musique à la fois, commune aux trois onglets, avec fondus, effets audio (Effets, Reset) et carré stop sur la tuile.
- **Barre du haut des onglets sons** : un bouton « ⏹ Couper les sons » qui coupe tous les sons en cours, quel que soit l'onglet son d'où ils viennent (la musique continue), le bouton d'arrêt d'urgence et le volume des sons. Pas de barre de lecture, ni de boutons Effets et Reset.
- **Deux volumes** : un pour les sons (commun à Animaux et Bruits), un pour les musiques (commun aux trois onglets musiques). Par exemple : une musique de fond douce, puis un bruit fort par-dessus.
- **Une couleur par type d'onglet** au lieu d'une par onglet : violet pour le piano (onglets MIDI), vert pour les sons, jaune pour les musiques. La couleur dit ce que pilote la barre du haut.
- **Grillons et Cigales** passent d'Animaux à Ambiances : trop longs, ils sonnent comme des ambiances (ils ont maintenant fondus et effets).

### À savoir

- L'arrêt d'urgence coupe toujours tout, depuis n'importe quel onglet : le piano, la musique et tous les sons en cours.
- Un son est lu en entier une première fois au premier clic (depuis le cache hors ligne), puis gardé en mémoire : les clics suivants partent tout de suite. Changer d'onglet ne charge rien. Les sons gardés en mémoire sont limités à environ 50 Mo ; au-delà, les sons joués il y a le plus longtemps sont oubliés (ils seront relus au prochain clic).
- Animaux a désormais 30 sons sur 32 places : les tuiles après le grillon et la cigale ont remonté d'une ou deux places, et les deux dernières cases sont vides.
- Pour les développeurs : chaque onglet audio déclare `kind: 'sounds'` ou `kind: 'music'` ; l'option `accent` des onglets disparaît (couleurs dans `TAB_ACCENTS`, `src/config/tabs.ts`) ; `noFade` ne sert plus que dans les onglets musiques (retirée des Bruits). Les sons passent par `src/audio/sounds.ts` (AudioBuffer, une voix par clic), branchés après les effets, directement sur le limiteur.

### À vérifier sur la tablette

- **Délai du premier clic** sur un son jamais joué depuis le lancement de l'appli (le fichier est lu puis décodé) : il doit rester comparable à avant. Les clics suivants doivent partir instantanément. Si le premier clic traîne, le signaler (solution de repli prévue : jouer ce premier clic autrement pendant le décodage).
- Une musique lancée (Musiques ou Films), puis plusieurs sons d'Animaux et de Bruits par-dessus : la musique continue, les sons s'entendent ensemble ; « Couper les sons » les coupe et laisse la musique ; l'arrêt d'urgence coupe tout.
- Appareil photo cliqué très vite plusieurs fois : chaque clic s'entend, sans couper les précédents ; pas de claquement à l'arrêt d'un son.
- Huit sons longs ou plus en même temps (Tronçonneuse, Roulement de tambour, Annonce SNCF…) : pas de saturation, un 9e son part toujours.
- Les deux volumes : baisser l'un ne change pas l'autre ; passer d'Animaux à Bruits ne bouge pas le curseur des sons.
- Popup Effets sur une musique : les effets ne changent pas les sons lancés par-dessus.
- Barre du haut des onglets sons en paysage et en portrait (en portrait : « Couper les sons » à gauche de l'arrêt d'urgence, volume en dessous).
- Couleurs des onglets et des barres sur la tablette en Chrome 106.
- Hors ligne (mode avion), après « Télécharger tous les sons » : un son jamais joué se lance.

## 1.10.1 — 2026-11-08

### Corrections

- **Couleurs sur les vieilles tablettes (Chrome 106).** Sur une tablette dont Chrome ne peut plus être mis à jour (Android 6.0), les couleurs mélangées ne s'affichaient pas : tuiles des Animaux, Bruits, Ambiances et Musiques noires avec une bordure blanche, popups des effets transparentes (on voyait la grille derrière), presets sans contour, cadres des panneaux et boutons Effets/Reset sans teinte. Tout s'affiche maintenant comme sur un Chrome récent, où rien ne change (bug n° 26).

### À savoir

- L'application doit désormais rester compatible avec Chrome 106, la version de la tablette de scène.

### À vérifier sur la tablette

- Sur la tablette en Chrome 106 : les tuiles de chaque onglet de sons ont la couleur de leur famille ; le cadre des panneaux, les boutons Effets/Reset et le preset actif sont teintés ; la popup des effets a un fond opaque ; la barre de progression d'un son en lecture est colorée.
- Sur un appareil récent : rien n'a changé.

## 1.10.0 — 2026-11-08

### Nouveautés

- **Trois nouveaux onglets de sons** :
  - **Bruits** (32 boutons, même grille que les Animaux : 8 par ligne en paysage, 4 en portrait) : bureau et technologie (clavier, machine à écrire, modem 56k, erreur Windows, notification, bip morse, appareil photo, machine à café), téléphone et sonnettes (sonnerie, vibreur, tonalités, sonnette de porte et de vélo, annonce SNCF, foule « Amen »), gags (roulement de tambour, ba-dum-tss, buzzers bonne et mauvaise réponse, bébé qui pleure ou rit, verre d'eau, briquet), feu, lames et outils (prend feu, épées, meurtre au couteau, tronçonneuse, scies, klaxon, tic-tac de bombe).
  - **Ambiances** (26 boutons, même grille) : ville et lieux publics (ville, travaux, manifestation, gare, café, restaurant, discussions dehors et dedans, salle d'arcade, récréation, maternité, feux d'artifice), mer et nature (plage, mer, vagues et mouettes, mouettes, forêt, mare, troupeau, nuit à la campagne, vent, orage, feu de cheminée), peur (grotte, nuit angoissante, zombies).
  - **Musiques** (34 musiques cultes, hors films) en 11 familles colorées sur 4 colonnes, deux tuiles par ligne : Épique, Sombre et menace, Guerre, Cirque et cabaret, Burlesque, Démarches, Tubes pop rock rap, Lounge et bossa nova, Élégance classique, Douceur, Jeux télé et saloon. Chaque tuile a un emoji, un nom en gros (titre, artiste ou usage) et en petit ce qu'elle fait entendre. Chaque musique démarre directement sur son passage le plus connu.
- **Bruitages sans fondu d'entrée.** Un son peut démarrer net, tout de suite au volume choisi, au lieu de monter en 0,3 seconde. Utile pour un bruitage qui commence dès le début du fichier : la sonnette de porte est la première à en profiter.
- **Volume nivelé** dans les trois nouveaux onglets : les bruits et les musiques sont au même niveau entre eux, les ambiances un peu plus bas (elles restent en fond). Quelques sons aux crêtes très fortes restent un peu en dessous (feu de cheminée, prend feu, machine à écrire…). Dans *Dans l'antre du roi de la montagne*, le début, très doux, a été remonté pour s'entendre dès le départ de la tuile.

### À savoir

- Les nouveaux sons s'ajoutent au cache hors ligne : `public/sounds/` fait maintenant environ 190 Mo (films 94 Mo, musiques 62 Mo, ambiances 24 Mo). Après la mise à jour, « Télécharger tous les sons » (popup À propos) les met en cache.
- Dans l'onglet Animaux, le fichier de la cigale est renommé (`cigales_chant.mp3`) ; le bouton est inchangé.
- L'onglet Musiques est une première version : le visuel et les libellés seront encore revus.
- Pour les développeurs : les sons de Bruits, d'Ambiances et de Musiques sont rangés dans `public/sounds/bruits/`, `ambiances/` et `musiques/`, les anciens fichiers à la racine de `sounds/` ont disparu. Les options `noFade: true` (son) et `colSizes` (onglet en colonnes : nombre de familles par colonne) sont documentées dans le README.

### À vérifier sur la tablette

- Les trois onglets : le nombre d'onglets dans la barre du haut, les noms longs dans les boutons (« Mauvaise réponse », « Roulement de tambour », « Discussions dedans »), en paysage et en portrait.
- L'onglet Musiques : les 4 colonnes et leurs familles, la lisibilité des tuiles, en paysage et en portrait. Chaque musique part au bon endroit.
- Les volumes : passer d'un bruit à une musique ou à une ambiance ne fait pas de saut de volume gênant.
- La sonnette de porte démarre bien net, sans « clic » désagréable.
- Hors ligne, après « Télécharger tous les sons » : tous les nouveaux sons jouent.

## 1.9.1 — 2026-11-06

### Corrections

- **Repères du neutre bien visibles dans les popups d'effets.** Les petits traits qui marquent la position « sans effet » de chaque curseur sont plus épais et plus clairs. Ceux d'un neutre au bout du curseur (0 en bas pour Chorus, High-pass, Reverb, Delay ; 20 kHz en haut pour Low-pass) étaient à moitié coupés par le bord : ils tombent maintenant pile au centre de la poignée quand l'effet est au neutre (bug n° 25).

### À vérifier sur la tablette

- Popups des effets piano et audio, en paysage, en portrait et sur un téléphone en paysage : les repères se voient bien, et avec Reset, chaque poignée est posée exactement sur ses repères.

## 1.9.0 — 2026-11-05

Cette version suit la revue de code de la 1.8.0 : le hors ligne devient fiable avant un spectacle, la mise à jour se force depuis la popup À propos, et plusieurs petits défauts de lecture sont corrigés.

### Nouveautés

- **Télécharger tous les sons pour le hors ligne.** Dans la popup À propos (⚙), « ⬇ Télécharger tous les sons » met en cache tous les sons et toutes les images de couverture. Un compteur indique où on en est (« Hors ligne : 68 / 68 sons, 36 / 36 images »). Avant, un son n'était disponible hors ligne qu'après avoir été joué une fois. Les fichiers déjà en cache ne sont pas retéléchargés.
- **Stockage protégé.** L'application demande à Chrome de ne pas effacer ses fichiers quand l'appareil manque de place. La popup À propos indique si c'est accordé (« Stockage : protégé ✓ ») : Chrome l'accorde en général à l'application installée.
- **« ⟳ Mettre à jour l'application »** remplace « Vider le cache et recharger ». Le bouton installe la dernière version publiée puis recharge, sans retélécharger les sons. Hors ligne, il ne recharge rien et affiche « Hors ligne : mise à jour impossible ». Avant, appuyé hors ligne, il pouvait empêcher l'application de s'ouvrir jusqu'au retour du réseau.
- **Un Reset par type d'effets.** Le Reset d'un onglet MIDI ne remet à zéro que les effets du piano, et celui d'un onglet de sons que les effets audio. Chacun s'allume seulement pour ses effets. Avant, les deux Reset remettaient tout à zéro (bug n° 19).
- **Popup des effets épurée.** Les valeurs chiffrées et les étiquettes en trois lettres au-dessus des curseurs ont disparu. Seul reste le nom sous chaque curseur, plus gros et plus lisible, en jaune quand l'effet est actif.
- **Popup des effets sur téléphone en paysage.** Les curseurs étaient écrasés et les noms coupés lettre par lettre. Chaque carte montre maintenant son bouton reset en haut, un curseur haut, et le nom entier en bas. Les presets sont des tuiles basses, icône à côté du texte.
- **Barre des panneaux sur petit écran.** En paysage sur un téléphone, les boutons affichent « FX » et « RAZ » (remise à zéro), au lieu de n'avoir qu'une icône. Avant, entre 900 et 1 000 px de large environ, la barre débordait et coupait la valeur du volume (bug n° 24).
- **Preset Studio refait.** Il ne changeait presque rien : un peu de Release seulement, depuis que la réverbération est devenue l'Ambiance du piano. Il donne maintenant un son sec et proche, comme un piano enregistré de près : sans réverbération, un peu plus brillant, avec une attaque franche et des notes qui s'arrêtent net. À ajuster à l'oreille.
- **Plein écran.** Un bouton « Plein écran » (avec son icône) dans la popup À propos (⚙) masque la barre d'adresse et les barres du système, utile quand l'application est ouverte dans un onglet Chrome. Le même bouton en sort. Le geste ou la touche Retour du système en sortent aussi.
- **Popup À propos** : plus haute que l'écran (téléphone en paysage), elle défile, et « Fermer » reste accessible.
- **Piano Bluetooth proposé après un rechargement**, même dans Edge. La liste propose toujours « ᛒ FP-30X ». Si le navigateur ne sait pas retrouver le piano, le choisir ouvre le sélecteur avec ce seul piano. L'application ne se connecte jamais toute seule au lancement.
- **Polices intégrées à l'application.** Elles ne viennent plus de Google : le premier lancement hors ligne a les bonnes polices. L'affichage est identique.

### Corrections

- **Son qui grésille avec les effets audio à fond** (réverbération, delay, basses) : un limiteur empêche maintenant la sortie de saturer. Sans effet fort, le son est inchangé (bug n° 21).
- **Bas de l'écran coupé dans un onglet Chrome** : la dernière rangée de boutons passait sous la barre d'adresse. L'application installée n'était pas touchée (bug n° 23).
- **Volume baissé juste après le lancement d'un son** : il était ignoré pendant le fondu d'entrée, et il s'applique maintenant tout de suite (bug n° 11).
- **Reprise après pause puis STOP rapide** : la reprise pouvait toucher au son suivant et laissait une erreur dans la console (bug n° 10).
- **Fichier son manquant** : il était demandé deux fois, avec une erreur dans la console (bug n° 20).
- **Mémoire** : chaque son joué gardait son lecteur audio jusqu'au nettoyage automatique de Chrome. Il est maintenant libéré tout de suite (bug n° 22).
- **Wake Lock** : la popup À propos l'affichait « actif » alors qu'il ne l'était plus (bug n° 12).

### À savoir

- **Avant un spectacle** : ouvrir la popup À propos avec du réseau, et appuyer sur « ⬇ Télécharger tous les sons » jusqu'à ce que le bouton disparaisse.
- **Arrêt d'urgence** : la queue d'effet de l'orgue signalée en 1.8.0 ne se produit plus (vérifié sur le piano). Le court fondu de sortie des sons au STOP est voulu.
- **Un son remplacé** dans `public/sounds/` doit changer de nom, sinon la tablette garde l'ancien (bug n° 14, laissé tel quel).

### À vérifier sur la tablette

Avec `docs/checklist.md`, en particulier :
- le téléchargement de tous les sons, puis un son jamais joué en mode avion ;
- « Mettre à jour l'application » en ligne et en mode avion ;
- les deux Reset séparés ;
- la popup des effets en paysage et en portrait, et sur un téléphone en paysage ;
- « Plein écran » dans un onglet Chrome, puis sa sortie ;
- le preset Studio sur le piano ;
- « FX » et « RAZ » dans la barre, sur un téléphone en paysage ;
- un son fort avec réverbération et basses à fond : plus de grésillement, et sans effet, le son n'a pas changé ;
- la dernière rangée de boutons dans un onglet Chrome ;
- après un rechargement, « ᛒ FP-30X » dans la liste.

## 1.8.0 — 2026-11-05

Cette version change la façon dont l'application pilote le piano. Les instruments et les effets partent sur le canal MIDI 4, celui du son du clavier du FP-30X : choisir une tuile change directement ce que jouent les touches. Le piano n'est plus mis en Local Off, et l'application ne lui renvoie plus les notes jouées.

### Nouveautés

- **Un seul son au clavier.** Avant, choisir un violon faisait entendre le violon et le piano en même temps, sauf si on coupait le son du piano à la main (Function + fa grave). Il n'y a plus rien à faire sur le piano, et son voyant de catégorie suit l'instrument choisi.
- **Réverbération qui fonctionne.** Le curseur REV règle l'Ambiance du piano, de 0 à 10 (1 par défaut, comme sur le piano). Il fonctionne de la même façon en USB et en Bluetooth. Les presets d'effets ont été ajustés à cette échelle.
- **Reconnexion Bluetooth automatique.** Si la liaison tombe (piano éteint puis rallumé, interférence), l'application se reconnecte toute seule pendant 20 secondes. Le badge affiche « ◌ BT… » pendant l'essai, puis « BT perdu » s'il échoue.
- **Piano Bluetooth connu.** Le dernier piano connecté est proposé dans la liste (« ᛒ FP-30X ») pour s'y reconnecter sans passer par le sélecteur. « ᛒ Autre appareil Bluetooth… » ouvre le sélecteur.
- **État du piano renvoyé à chaque connexion.** À chaque connexion ou reconnexion, en USB comme en Bluetooth, l'application renvoie l'instrument surligné, le volume et tous les effets. Le piano joue donc toujours ce qu'affiche l'écran.
- **Câble USB suivi.** Un câble débranché fait repasser le badge à « Non connecté ». Un piano branché après le lancement est connecté automatiquement.
- **Curseurs fluides.** Pendant un preset ou un Reset, les curseurs glissent sans à-coups, même ceux qui n'ont que quelques crans, comme REV.
- **Badge plus précis** : il affiche « ● USB », « ● BT », « ◌ BT… », « BT perdu », « Bluetooth désactivé », « Bluetooth refusé » ou « Échec BT ».

### Corrections

- **Notes qui restaient tenues en Bluetooth** (bug n° 8). C'est corrigé par le passage au canal 4 : l'application ne renvoie plus les notes au piano.
- **Effets envoyés en rafale.** Pendant une animation, l'application renvoyait les 7 effets à chaque image. Elle n'envoie plus que les valeurs qui changent, et rien si tout est déjà en place (bug n° 9).
- **Instrument et effets perdus après une reconnexion** (bug n° 13).
- **Connexion Bluetooth en cours qui écrasait un autre choix**, par exemple l'USB choisi pendant l'attente (bug n° 15).
- **Liaison Bluetooth laissée ouverte après un échec de connexion** (bug n° 16).
- **Câble USB débranché ou branché après le lancement**, que l'application ne voyait pas (bug n° 17).
- **Arrêt d'urgence plus rapide** : il coupe d'abord le son du clavier, avec All Sound Off, puis s'occupe des autres canaux.

### À savoir

- **En USB, Chrome demande une fois l'autorisation de « contrôler entièrement les appareils MIDI »**, c'est-à-dire d'envoyer des SysEx. Il faut l'accepter : sans elle, l'USB marche, mais le curseur REV n'a aucun effet.
- Le réglage de la réverbération passe par un message propre à Roland (SysEx), que Roland ne documente pas. Il a été vérifié sur le FP-30X. Le détail est dans `docs/fp30x-midi.md`.

### Limites connues

- **Arrêt d'urgence** : avec un orgue et beaucoup d'effet, on entend encore la queue du son après STOP (bug n° 18, cause à confirmer).
- **Après un rechargement de la page**, Edge sur PC ne retrouve pas le piano Bluetooth : il faut repasser par le sélecteur. Ce point reste à vérifier sur la tablette.
- Les autres points ouverts sont listés dans `docs/revue-code.md`.

### À vérifier sur la tablette

Avec `docs/checklist.md`, en particulier :
- le son unique au clavier ;
- l'absence de notes tenues en Bluetooth avec l'orgue ;
- la reconnexion automatique (éteindre puis rallumer le piano) ;
- la réverbération en USB et en Bluetooth.
