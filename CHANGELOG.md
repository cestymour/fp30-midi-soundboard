# Historique des versions

La version la plus récente en haut. Les versions antérieures à la 1.8.0 ne sont décrites que par l'historique git.

## 1.10.0 — 2026-11-07

### Nouveautés

- **Trois nouveaux onglets de sons**, avec la même grille que les Animaux (32 boutons, 8 par ligne en paysage, 4 en portrait) :
  - **Bruits** (32 boutons) : bureau et technologie (clavier, machine à écrire, modem 56k, erreur Windows, notification, bip morse, appareil photo, machine à café), téléphone et sonnettes (sonnerie, vibreur, tonalités, sonnette de porte et de vélo, annonce SNCF, foule « Amen »), gags (roulement de tambour, ba-dum-tss, buzzers bonne et mauvaise réponse, bébé qui pleure ou rit, verre d'eau, briquet), feu, lames et outils (prend feu, épées, meurtre au couteau, tronçonneuse, scies, klaxon, tic-tac de bombe).
  - **Ambiances** (26 boutons) : ville et lieux publics (ville, travaux, manifestation, gare, café, restaurant, discussions dehors et dedans, salle d'arcade, récréation, maternité, feux d'artifice), mer et nature (plage, mer, vagues et mouettes, mouettes, forêt, mare, troupeau, nuit à la campagne, vent, orage, feu de cheminée), peur (grotte, nuit angoissante, zombies).
  - **Musiques** : pour l'instant un seul bouton, la musique d'ascenseur. Les musiques cultes prévues (*You Can Leave Your Hat On*, *Ainsi parlait Zarathoustra*, *O Fortuna*) n'ont pas encore leur fichier.
- **Bruitages sans fondu d'entrée.** Un son peut démarrer net, tout de suite au volume choisi, au lieu de monter en 0,3 seconde. Utile pour un bruitage qui commence dès le début du fichier : la sonnette de porte est la première à en profiter.

### À savoir

- Les nouveaux sons s'ajoutent au cache hors ligne : `public/sounds/` fait maintenant environ 150 Mo (les ambiances, 42 Mo, sont les plus lourdes). Après la mise à jour, « Télécharger tous les sons » (popup À propos) les met en cache.
- Dans l'onglet Animaux, le fichier de la cigale est renommé (`cigales_chant.mp3`) ; le bouton est inchangé.
- Pour les développeurs : les sons de Bruits, d'Ambiances et de Musiques sont rangés dans `public/sounds/bruits/`, `ambiances/` et `musiques/`, les anciens fichiers à la racine de `sounds/` ont disparu. L'option `noFade: true` est documentée dans le README.

### À vérifier sur la tablette

- Les trois onglets : le nombre d'onglets dans la barre du haut (deux de plus qu'avant), les noms longs dans les boutons (« Mauvaise réponse », « Roulement de tambour », « Discussions dedans »), en paysage et en portrait.
- L'onglet Musiques, avec son bouton unique.
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
