# Personnalisation de l'interface : cahier des charges

Document de travail pour la personnalisation de l'interface (voir `docs/todo.md`). État : **cahier des charges** (2026-11-19), rien n'est codé. La fonctionnalité sortira d'un bloc, dans une version majeure ; l'ordre de sortie avec le looper n'est pas décidé.

## Le besoin

L'utilisateur de la tablette veut organiser l'application à sa façon : garder les tuiles qu'il utilise et retirer les autres, ranger chaque tuile où il veut, et choisir ses onglets et ses catégories. Il peut enregistrer plusieurs organisations sous un nom et passer de l'une à l'autre.

## Vocabulaire

- **Personnalisation** : la fonctionnalité. Le bouton qui ouvre l'éditeur s'appelle « Personnaliser ».
- **Disposition** : une organisation enregistrée, avec un nom : les onglets, leurs catégories, la place et la couleur des tuiles. L'application en garde plusieurs ; une seule est **active**. **« Par défaut »** est la disposition définie par la configuration du code (`MIDI_TABS`, `AUDIO_TABS`).
- **Type d'onglet** : **piano**, **sons** ou **musiques** (`TabKind` : `midi`, `sounds`, `music`). Une tuile a le type de son onglet.
- **Grille** d'un onglet, de deux sortes :
  - **grille fixe** (`gridType: 'fixed'` : Animaux, Bruits, Ambiances) : 32 cases, sans catégorie ;
  - **grille à catégories** (Instruments, Sons MIDI, Musiques, Films) : les tuiles sont rangées par catégorie ; dans Musiques et Films, les catégories sont réparties **en colonnes** (`cols`).
- **Réserve** : les tuiles qui ne sont dans aucun onglet de la disposition.
- **Mode d'édition** : l'état de l'application pendant qu'on modifie une disposition.
- **Menu d'une tuile** : ce qui s'ouvre quand on touche une tuile en mode d'édition.

## 1. Ce que contient une disposition

- **Les onglets** : leur liste, leur ordre, et pour chacun son type, son nom, son emoji et sa grille ;
- **les catégories** des grilles à catégories : leur nom, emoji, couleur et place ;
- **la place de chaque tuile** : à un rang dans une catégorie, dans une case de grille fixe, ou dans la réserve ;
- **la couleur des tuiles** des grilles fixes.

Le contenu d'une tuile (fichier, patch MIDI, début et fin, image), la couleur des onglets (celle de leur type, `TAB_ACCENTS`) et la taille des grilles (colonnes, cases) viennent toujours de la configuration.

### Les grilles

- **Grille fixe** : 32 cases, 4×8 en paysage, transposée en portrait (une tuile placée en portrait se retrouve à la case correspondante en paysage). Une case peut rester **vide** : la place d'une tuile compte (les blocs de couleur par thème), et retirer une tuile ne décale pas les autres.
- **Grille à catégories** : chaque catégorie est une liste ordonnée de tuiles, sans trou. Retirer une tuile resserre sa catégorie.

### Où une tuile peut aller

- Dans **n'importe quel onglet de son type**, jamais d'un type à l'autre : la barre de commandes du panneau (volume, effets, arrêt) dépend du type.
- À **un seul endroit** : dans un onglet, ou dans la réserve. Sa progression, son surlignage (instrument actif) et ses voix lui sont propres ; la même tuile dans deux onglets serait source de confusion sur scène.
- Une tuile retirée **disparaît de la grille** et va dans la réserve : la grille montre toujours ce qu'elle sera hors du mode d'édition.

### La réserve

- Elle contient les tuiles placées nulle part : retirées par l'utilisateur, ou fournies par la configuration sans être placées dans « Par défaut » (section 8).
- En mode d'édition, un panneau la montre, avec **les tuiles du type de l'onglet affiché**, regroupées par onglet d'origine.

## 2. Le mode d'édition

On ne modifie pas une disposition pendant le spectacle : hors du mode d'édition, rien ne bouge sous le doigt.

- On entre dans le mode d'édition par « Personnaliser », dans la popup Paramètres : on modifie alors la disposition active. Si c'est « Par défaut », qui ne se modifie pas, l'application propose d'abord d'en créer une (section 6).
- Un bandeau bien visible indique le mode d'édition, avec un bouton « Terminé », qui enregistre et revient au mode normal.
- Toucher une tuile **ne la joue pas**. Un toucher simple ouvre son **menu** : « Retirer », et sa couleur dans une grille fixe. Un toucher suivi d'un glissement la déplace (section 3).
- On change d'onglet comme d'habitude.
- Ce qui joue déjà (musique, sons, musique de transition) continue. L'arrêt d'urgence reste actif.

## 3. Déplacer les tuiles

On déplace les tuiles une par une, par glisser-déposer, comme les icônes sur l'écran d'accueil d'un téléphone : on prend une icône, les autres se poussent, on la lâche où on veut.

### Le geste

- **Pas d'appui long** pour prendre une tuile : comme toucher ne joue pas, le glissement commence dès que le doigt bouge de quelques pixels. Exception : dans la réserve, si elle défile, l'appui long évite de confondre défilement et glissement.
- La tuile suit le doigt, et **les autres tuiles bougent en direct**, avec une animation, pour montrer le résultat avant qu'on lâche. Lâcher hors d'un emplacement valide annule : la tuile revient à sa place.
- **Changer d'onglet** : tenir la tuile un court instant au-dessus d'un onglet de la barre du haut l'ouvre (comme le bord de l'écran qui change de page sur un téléphone), et on continue de glisser. Seuls les onglets du même type réagissent ; les autres sont atténués pendant le glissement.
- **Retirer** : lâcher la tuile sur la réserve, ou « Retirer » dans son menu. **Remettre** : la tirer de la réserve jusqu'à sa place.

### Où la tuile se pose

- **Dans une catégorie : insertion.** Les voisines s'écartent pour faire la place. Lâchée sur le titre d'une catégorie ou dans une catégorie vide, la tuile va à la fin de cette catégorie.
- **Dans une grille fixe, sur une case vide** : la tuile s'y pose.
- **Dans une grille fixe, sur une case occupée** :
  - si la tuile vient de la même grille, les deux tuiles **échangent** leur place (une insertion décalerait toutes les suivantes et casserait les blocs) ;
  - si elle vient d'ailleurs (autre onglet, réserve), elle prend la case, et l'occupante va dans la réserve. L'aperçu le montre avant qu'on lâche (l'occupante s'efface vers la réserve).

## 4. Onglets et catégories

### Onglets

- **Ajouter** un onglet : on choisit son **type** (il ne change plus ensuite), son **nom**, son **emoji** et sa **grille**, reprise d'un onglet existant du même type : grille à catégories comme Instruments pour le piano ; grille fixe comme Bruits, ou grille à catégories en colonnes comme Musiques, pour les sons et les musiques. Il arrive vide.
- **Supprimer** un onglet, avec confirmation : ses tuiles vont dans la réserve.
- **Renommer** un onglet, changer son **emoji**, **changer l'ordre** des onglets en les glissant dans la barre du haut.
- **Au moins un onglet**, de n'importe quel type : aucun type n'est obligatoire. Sans onglet piano, le choix de la connexion au piano (dans la barre des onglets piano) n'apparaît pas, et rien ne le remplace ni ne le signale ; l'application marche sans erreur (arrêt d'urgence, musique de transition, sons, musiques).
- **Nombre maximal d'onglets** : la barre du haut ne défile jamais et se replie jusqu'à n'afficher que les emojis (`TabNav`). La limite est le nombre d'onglets qui tiennent sur une ligne en emojis seuls, en portrait, sur la tablette ; elle est fixée dans le code. Au-delà, « Ajouter un onglet » est grisé.

### Catégories

Dans les grilles à catégories :

- **ajouter** une catégorie (nom, emoji, couleur) : elle arrive vide ;
- **modifier** le nom, l'emoji et la couleur d'une catégorie, celles de « Par défaut » comprises ;
- **supprimer** une catégorie : ses tuiles vont dans la réserve ;
- **déplacer** une catégorie en glissant son titre, avec toutes ses tuiles : insertion, comme pour les tuiles ; vers un autre onglet du même type, par la barre du haut.

Dans les grilles en colonnes (Musiques, Films), on choisit la **colonne et le rang** de chaque catégorie en la glissant.

## 5. Couleurs des tuiles

- **Dans une grille fixe**, la couleur d'une tuile dit son thème (ferme, oiseaux, maison, téléphone…). Au départ, c'est celle de la configuration (`catClass`) ; l'utilisateur peut la changer :
  - pour une tuile, dans son menu ;
  - pour plusieurs tuiles, un bouton « Couleur » de l'éditeur passe en **sélection** (chaque toucher ajoute ou enlève une tuile), puis on choisit une couleur, appliquée à toutes d'un coup ;
  - « Couleur d'origine » rend la couleur de la configuration ;
  - les couleurs viennent d'une **palette** (celles des thèmes actuels, plus quelques autres) : elles restent lisibles sur le fond sombre et cohérentes avec le reste de l'application.
- **Dans une grille à catégories**, la tuile prend la couleur de sa catégorie, là où l'onglet colore les tuiles (Musiques).
- Une tuile garde sa couleur de grille fixe quand elle passe par une catégorie ou par la réserve, et la retrouve en revenant dans une grille fixe.

## 6. Les dispositions enregistrées

- La popup Paramètres montre la liste : **« Par défaut »** en tête, puis les dispositions de l'utilisateur, chacune avec son nom. La disposition active est cochée ; elle est retrouvée au lancement.
- **« Par défaut »** est en lecture seule : on ne peut ni la modifier, ni la renommer, ni la supprimer.
- **Créer** une disposition : on lui donne un nom et on choisit son point de départ :
  - **une disposition existante**, « Par défaut » comprise, dont elle est une copie ;
  - **une disposition vide** : un onglet vide par type, avec la grille d'Instruments, de Bruits et de Musiques ; toutes les tuiles sont dans la réserve.
- **Activer**, **modifier** (mode d'édition), **renommer**, **supprimer** (avec confirmation ; pas la disposition active : il faut d'abord en activer une autre).
- **Exporter / importer** une disposition dans un fichier, pour la sauvegarder ou la passer sur une autre tablette. Une disposition importée s'ajoute à la liste sans rien remplacer (renommée si son nom est déjà pris).
- Les dispositions restent sur la tablette (`localStorage`).

## 7. Contraintes techniques

### Format et application

- Une disposition **ne recopie pas les tuiles** : elle les désigne par leur `id`, et la configuration reste la seule source des fichiers, patchs, libellés et images. Elle désigne de même les onglets et catégories de la configuration par leur `id`, et décrit en entier ceux créés par l'utilisateur, qui reçoivent un `id` généré et unique (les `id` d'onglets restent uniques entre piano et audio).
- Elle porte un **numéro de format**, pour pouvoir la relire après une évolution de ce format.
- Les composants lisent toujours les onglets par `getMidiTabs()` / `getAudioTabs()` (`src/config/tabs.ts`) : c'est là que s'applique la disposition active, par une **fonction pure** (configuration + disposition → onglets affichés), testée par Vitest.
- L'onglet actif est retenu par son `id` : s'il n'existe plus, le premier onglet s'ouvre.

### Identifiants des tuiles

Un `id` de tuile n'est aujourd'hui garanti unique que dans sa catégorie. Vérifié le 2026-11-19 : aucun ne se répète d'un onglet à l'autre (88 tuiles piano, 166 tuiles sons et musiques). La règle devient : **`id` de tuile unique pour tout son type**, vérifiée par `config.test.ts` et notée dans `CLAUDE.md` et le README.

### Mises à jour de l'application

La configuration évolue d'une version à l'autre ; les dispositions suivent sans intervention :

- **tuile ajoutée** : elle apparaît dans « Par défaut » ; dans les autres dispositions, elle va dans la réserve, marquée « nouvelle » ;
- **tuile supprimée** : elle disparaît (sa case reste vide dans une grille fixe) ;
- **onglet ou catégorie supprimé** : ses tuiles qui sont encore à sa place vont dans la réserve ; celles que l'utilisateur a placées ailleurs n'en bougent pas ;
- **onglet ou catégorie modifié** (nom, emoji, couleur) : la disposition suit la configuration, sauf pour ce que l'utilisateur a lui-même modifié ;
- une disposition **illisible** n'empêche jamais l'application de démarrer : elle revient à « Par défaut » et le signale.

### Mise en page

- L'égalisation des hauteurs de boutons (`equalizeMidiButtons`, `equalizeAudioButtons`), la répartition des catégories en portrait (`MidiPanel.svelte`) et les colonnes de Musiques et Films fonctionnent avec un nombre quelconque de catégories et de tuiles.
- Une grille à catégories peut recevoir plus de tuiles que l'écran n'en montre : l'éditeur le **signale** (l'onglet déborde), dans les deux orientations.

### Hors ligne

« Télécharger tous les sons » (`src/offline.ts`) télécharge les sons et images de **toutes les tuiles de la configuration**, réserve comprise, pas seulement celles de la disposition active : on doit pouvoir changer de disposition sans réseau. Le nettoyage des anciens fichiers porte de même sur toute la configuration.

### Navigateur

- **Afficher** une disposition ne demande rien de nouveau : ce ne sont que des données. Cette partie suit la règle Chrome 106 tant que la tablette actuelle sert.
- La tablette va changer : **l'éditeur** peut utiliser une fonction plus récente si elle le simplifie nettement (par exemple les View Transitions, Chrome 111, pour animer les déplacements). Le bouton « Personnaliser » est alors masqué sur un navigateur qui ne l'a pas ; la disposition active s'y affiche quand même.
- Le glisser-déposer s'écrit avec les **événements pointeur** (`pointerdown`, `pointermove`, `pointerup`, capture du pointeur), présents dans Chrome 106. Pas de glisser-déposer HTML5 (`draggable`) : il marche mal au doigt.

### Le reste de l'application

- Arrêt d'urgence, musique de transition, effets et connexion au piano ne dépendent pas de la disposition ; seul l'accès au choix de la connexion disparaît sans onglet piano (section 4).
- L'instrument surligné, la progression d'une musique et les voix d'un son suivent la tuile, où qu'elle soit.

## 8. Tuiles en réserve dans la configuration

La configuration peut déclarer des **tuiles disponibles mais pas placées dans « Par défaut »** (par exemple une liste de réserve par type) : elles arrivent dans la réserve, et l'utilisateur les place s'il en a l'usage. C'est le moyen d'avoir plus de tuiles que de cases : les tuiles aujourd'hui en commentaire faute de place (perceuse, Café, Restaurant, Salle d'arcade, galop…) et les idées de `docs/todo.md` (toc-toc, verre brisé, oie…) pourraient y aller, sans retirer d'autres tuiles. Les règles de `docs/sons.md` s'y appliquent comme aux autres sons.

## 9. Bonus et plus tard

- Bonus, seulement si c'est simple : renommer une tuile, changer son emoji (dans son menu).
- Plus tard, comme une fonctionnalité à part : **importer ses propres fichiers son**, en priorité pour la musique de transition (stockage dans le navigateur, niveau sonore, place sur le disque).

## 10. Questions ouvertes

1. Onglets piano en portrait : la répartition des catégories sur 2 colonnes reste-t-elle automatique, ou l'utilisateur la choisit-il, comme dans Musiques et Films ?
2. Nombre maximal d'onglets : à mesurer sur la nouvelle tablette.
