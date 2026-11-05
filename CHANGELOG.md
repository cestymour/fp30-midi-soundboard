# Historique des versions

La version la plus récente en haut. Les versions antérieures à la 1.8.0 ne sont décrites que par l'historique git.

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
