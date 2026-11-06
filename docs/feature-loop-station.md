# Looper (loop station) : cahier des charges

Document de travail pour le looper prévu en 2.0 (voir `docs/todo.md`). État : **étude de faisabilité** (2026-11-06). Rien n'est codé.

## Règle de conception

**Le looper se comporte comme une loop station, et rien de plus.** Le modèle est la **Boss RC-505 mk2** ; ses manuels officiels font référence (sources en fin de document). On n'invente aucune fonction qui n'existe pas sur une loop station : l'utilisateur n'en a jamais utilisé, il ne pourrait pas repérer un écart, et ceux qui conçoivent ces appareils ont déjà réfléchi à leur fonctionnement.

L'application enregistre des notes MIDI là où la RC-505 mk2 enregistre du son. Cette différence technique **ne doit pas s'entendre ni se voir à l'usage** : l'utilisateur doit avoir l'impression de se servir d'une loop station. Les écarts inévitables sont signalés comme contraintes techniques (la réverbération, par exemple). Avant d'ajouter une fonction, vérifier qu'elle existe dans les manuels de la RC-505 mk2. Seule exception, notée à part : les évolutions que seul le MIDI permet (section 8), jamais en première version.

## Décisions (2026-11-06)

- **Modèle de référence : RC-505 mk2** (loop station de table, jouée à la main, 5 pistes). C'est le modèle visé depuis le début ; la RC-500 (pédalier, 2 pistes) avait été consultée par erreur.
- **On enregistre les notes (MIDI)**, pas le son (voie A, section 3). Raison principale : la tablette est peu puissante. La voie audio (B) reste décrite pour mémoire.
- **USB uniquement** : le looper est désactivé (grisé, avec une explication) quand le piano n'est pas branché en USB.
- **Plusieurs pistes dès la première version** : au moins 2, avec un code prévu pour en avoir 5 comme la RC-505 mk2 (le nombre de pistes ne doit être qu'un paramètre).
- **Réglages par défaut de la RC-505 mk2**, sans exception : l'application démarre avec les mêmes valeurs que l'appareil (section 2). En particulier, l'**Auto Rec est désactivé** par défaut ; l'utilisateur l'active dans les réglages s'il le souhaite.
- **Arrêt à la main**, sur la tablette (une main au clavier, l'autre sur la tablette). Le réglage qui arrête l'enregistrement tout seul au bout de N mesures n'est pas repris.
- **Pas de tempo à régler** pour la première version : sans rythme, la première boucle dure exactement le temps entre le départ et l'arrêt.
- **Pas de mémoires** : une boucle est jouée une fois, pendant la scène ; rien n'est conservé d'une séance à l'autre.

## 1. Le besoin

Sur scène, au piano :

1. choisir un instrument dans l'application (déjà possible) ;
2. démarrer un enregistrement ;
3. jouer quelques notes ;
4. arrêter l'enregistrement : ce qui vient d'être joué repart aussitôt en boucle ;
5. changer d'instrument et jouer par-dessus la boucle, en l'ajoutant (et ainsi de suite).

## 2. Comment fonctionne une RC-505 mk2

Relevé dans le manuel d'utilisation et le guide des paramètres (sources en fin de document). Les valeurs par défaut sont celles du guide.

### Vocabulaire

- **Piste (track)** : un « gros bouton rond » et ce qui va avec. La RC-505 mk2 en a **5**. Chaque piste a sa propre boucle et son **curseur de volume**.
- **Enregistrement (recording)** : le premier enregistrement sur une piste vide.
- **Superposition (overdubbing)** : tout enregistrement suivant sur la même piste, ajouté par-dessus ce qui tourne. Les superpositions se **fondent** dans la piste : on ne peut plus régler l'une par rapport à l'autre. Pour garder deux parties réglables séparément, on les met sur deux pistes.
- **Mémoire** : les 5 pistes, les effets et le rythme, enregistrés ensemble (99 mémoires).

### Les commandes d'une piste

De haut en bas, pour chacune des 5 pistes :

- **bouton FX** : applique ou non les effets à la piste ;
- **bouton TRACK** : réglages de la piste ; allumé si la piste contient une boucle ;
- **bouton STOP (■)** : arrête la piste. **Appui long (2 s)** : efface la piste (Clear) ;
- **gros bouton rond REC/PLAY (▶/●)** :
  - piste vide : Enregistrement → Lecture → Superposition → Lecture → Superposition… ;
  - piste qui contient une boucle : Lecture → Superposition → Lecture… ;
  - couleur : rouge = enregistrement, vert = lecture, jaune = superposition, éteint = arrêtée ;
- **indicateur de boucle** : état de la piste, position dans la boucle, niveau ;
- **curseur de volume** de la piste.

### Les commandes générales

- **ALL START/STOP** : lance toutes les pistes ensemble, ou les arrête toutes.
- **UNDO/REDO** : un bouton qui fait passer les gros boutons ronds en mode annulation ; on touche alors le bouton rond de la piste voulue pour **annuler son dernier enregistrement ou sa dernière superposition** (Undo), ou la remettre (Redo). Fonction avancée MARK BACK : marquer une superposition pour pouvoir revenir à cet état plus tard, même après plusieurs superpositions.
- **TAP TEMPO**, **rythme** (START/STOP, réglages), **effets d'entrée et de piste** (4 banques × 4 effets), **volume général**.

### Réglages d'une piste (valeurs par défaut en gras)

- **PLAY LEVEL** (**100**), **PAN** (**centre**).
- **START MODE** : **immédiat** ou en fondu. **STOP MODE** : **immédiat**, en fondu, ou à la fin du tour.
- **DUB MODE** : **OVERDUB** (ajouter par-dessus) ou REPLACE (remplacer au fur et à mesure).
- **REVERSE** (**off**), **1SHOT** (**off** : lecture une seule fois, sans boucler).
- **PLAY MODE** : **MULTI** (toutes les pistes jouent ensemble) ou SINGLE (une seule à la fois : lancer une piste arrête l'autre, pour passer d'un couplet à un refrain).
- **LOOP SYNC** (**on**) : les pistes restent calées sur la même boucle. Une piste lancée pendant que d'autres jouent démarre à la position courante de la boucle, pas à son début.
- **MEASURE** (**FREE**) : la longueur de la piste en mesures, fixée par la durée de l'enregistrement (FREE), identique à la première piste (AUTO), ou fixée à l'avance (l'enregistrement s'arrête alors tout seul).
- **TEMPO SYNC** (**on**) : la piste suit le tempo de la mémoire.
- **BOUNCE IN** (**off**) : enregistrer aussi dans la piste le son des autres pistes.

### Réglages d'enregistrement (valeurs par défaut en gras)

- **REC ACTION** : **REC→PLAY** (l'ordre décrit plus haut) ou REC→DUB (Enregistrement → Superposition → Lecture).
- **AUTO REC** (**off**) : l'appui sur REC/PLAY met en attente (le bouton clignote) ; l'enregistrement démarre quand on se met à jouer, au-delà d'un seuil de sensibilité (**50**).
- **QUANTIZE** (**MEASURE**) : quand une référence de tempo existe (rythme allumé, piste déjà enregistrée en LOOP SYNC, synchro MIDI), le départ et l'arrêt de l'enregistrement sont recalés sur la mesure, et la durée sur celle de la piste déjà enregistrée. Sans référence (la toute première piste, sans rythme), l'enregistrement commence et finit à l'instant exact des appuis. **La quantification ne touche jamais aux notes jouées**, seulement aux limites de la boucle.
- **LOOP LENGTH** (**AUTO**) : la longueur de référence des pistes synchronisées est celle de la première boucle enregistrée.

### Rythme et tempo

- Une **boîte à rythmes** intégrée (genres, motifs, kits, signature, décompte, intro et fin).
- Le **tempo** se règle ou se tape (**TAP TEMPO**). Il sert au rythme, à la quantification et aux effets.

À vérifier à l'usage (le manuel est peu précis) : sans rythme, comment la RC-505 mk2 découpe la première boucle en mesures et cale les pistes suivantes (même durée, multiples, ou fractions de la première boucle).

## 3. Deux façons d'enregistrer

### A. Enregistrer les notes (MIDI) et les faire rejouer par le piano (retenu)

Le piano envoie en MIDI tout ce qui est joué au clavier (notes, vélocité, pédale de sustain). L'application horodate ces messages pendant l'enregistrement, puis les renvoie au piano en boucle.

Le point clé : **le piano est multitimbral**. Il reçoit les 16 canaux MIDI (manuel, « This piano receives all channels 1–16 »), chacun avec son propre instrument. Le canal 4 est le son du clavier (`docs/fp30x-midi.md`) ; les autres canaux sont des parties GM2 indépendantes. Chaque enregistrement ou superposition est donc rejoué sur **son propre canal**, avec l'instrument et les effets qu'il avait. Changer ensuite l'instrument du clavier (canal 4) ne change pas ce qui tourne déjà.

Avantages :

- aucun son ne transite par la tablette : qualité parfaite, aucune latence audio, le son sort des haut-parleurs du piano ;
- très peu de données (quelques kilo-octets par boucle), aucun calcul lourd ;
- une partie du nécessaire existe déjà : envoi MIDI, patchs, effets.

Limites et points à vérifier :

- **Les sons Roland propres au FP-30X** (ceux qui ne sont pas GM2, `msb` autre que 120/121) : sont-ils jouables sur un autre canal que le 4 ? À tester. Si non, une partie enregistrée avec un son Roland serait rejouée avec un son GM2 approchant.
- **La réverbération** : voir la section 4.
- **Polyphonie** : partagée entre le clavier et toutes les pistes. Le FP-30X a une polyphonie importante (256 voix selon Roland, à confirmer).
- **Nombre de canaux** : chaque enregistrement ou superposition occupe un canal, donc **15 au plus pour toutes les pistes réunies** (tous les canaux sauf le 4). Une RC-505 mk2 n'est limitée que par sa mémoire : c'est une contrainte technique propre à la voie MIDI. Deux superpositions de suite sur la même piste, avec le même instrument et les mêmes effets, peuvent partager un canal, ce qui repousse la limite. Quand il n'y a plus de canal libre, l'enregistrement est refusé avec un message clair.
- **Volume d'une piste** : le curseur de la piste agit sur tous les canaux de cette piste (par exemple avec le CC11, Expression, pour ne pas toucher au volume CC7 déjà utilisé par l'application). À vérifier : le FP-30X reçoit le CC11 (son implémentation MIDI le mentionne).
- **Précision rythmique** : en USB, Web MIDI horodate les notes reçues et programme l'envoi d'une note à l'instant voulu (`output.send(data, timestamp)`) : la boucle est rejouée à la milliseconde. (En Bluetooth, l'envoi part par paquets au rythme de la liaison : c'est une des raisons du choix de l'USB.)
- Le piano envoie ses notes par défaut (son canal de transmission, 1 à 16, n'a pas d'importance : l'application écoute tous les canaux).

### B. Enregistrer le son du piano (audio), pour mémoire

**Techniquement possible, mais seulement en USB.** Le manuel du FP-30X (p. 5, « USB Computer port ») indique que le port USB transporte les données de jeu *et les signaux audio* : le piano se présente comme une carte son. En Bluetooth, le piano ne fait que recevoir de l'audio (A2DP, il sert d'enceinte).

Côté tablette : Android reconnaît les cartes son USB, et Chrome peut enregistrer depuis une entrée audio USB (`getUserMedia`, en coupant l'annulation d'écho, la réduction de bruit et le gain automatique). L'enregistrement serait rejoué par le moteur Web Audio de l'application.

Avantages : on enregistre exactement ce qu'on entend (sons Roland, Ambiance, effets), comme une vraie loop station ; pas de limite liée aux canaux.

Inconnues et difficultés :

- la tablette voit-elle le piano comme carte son ? Rien ne le garantit ;
- la latence d'Android (souvent 20 à 100 ms aller-retour) est à mesurer et compenser, sinon chaque superposition est en retard ;
- si le piano renvoie dans son audio USB ce qu'il reçoit de la tablette, chaque superposition réenregistrerait les précédentes (doublement, voire larsen numérique) ;
- les sons de la soundboard suivraient le même chemin ;
- charge de calcul et mémoire (environ 10 Mo par 30 s en stéréo et par piste) sur une tablette peu puissante.

Le micro de la tablette est une autre voie audio, mais mauvaise : il capte la salle, le public et les comédiens.

## 4. Ce qui est enregistré (voie A)

Principe : comme une loop station, **on enregistre ce que l'on entend pendant l'enregistrement**, ni plus ni moins. À l'usage, rien ne doit trahir que ce sont des notes MIDI et non du son.

### Le jeu

Chaque message envoyé par le piano est gardé avec son instant (à la milliseconde, relatif au début de la boucle) :

- **appui sur une touche** (note on) : la note et sa **vélocité** (1 à 127, la force de frappe). Un pianissimo rejoue pianissimo, un forte rejoue forte ;
- **relâchement** (note off) : donc la durée exacte de chaque note ;
- **pédale de sustain** (CC64).

Les notes ne sont jamais déplacées : comme sur une loop station, ce qui est joué est rejoué tel quel.

À vérifier (essai 1) : que la vélocité envoyée reflète bien la frappe, et que le réglage de toucher du piano (Key Touch) ne fausse pas le rendu à la relecture.

### Le son : instrument et effets

L'enregistrement retient l'**instrument** (`pc`, `msb`, `lsb`) et la valeur de **chaque effet** du popup Effets piano au moment où il commence, et aussi **tout changement fait pendant l'enregistrement** (changement d'instrument, de preset, curseur déplacé), à l'instant où il a lieu : une loop station enregistre le son tel qu'il sort, changements compris. Ensuite, la partie est rejouée sur son propre canal avec ces réglages. Exemple : piste 1, trompette + Pad sur le canal 1 ; piste 2, harpe + Sombre sur le canal 2 ; le clavier (canal 4) peut passer à autre chose, la boucle garde son son.

| Effet | Message | Sur la partie rejouée |
|-------|---------|-----------------------|
| Chorus | CC93 | identique, envoyé sur le canal de la partie |
| Cutoff, Resonance | CC74, CC71 | identique |
| Attack, Release, Decay | CC73, CC72, CC75 | identique |
| Réverbération | Ambiance (SysEx, son du clavier seulement) | **remplacée par le CC91** du canal de la partie : une conversion de l'échelle 0-10 vers 0-127 à régler à l'oreille. Le rendu sera proche, pas identique (contrainte technique, à traiter plus tard). |

Point à vérifier (essai 4) : l'Ambiance du piano s'applique-t-elle aussi aux autres canaux ? Si oui, changer de preset pour une superposition changerait aussi la réverbération de ce qui tourne déjà. Il faudrait alors fixer l'Ambiance pendant le looper, et ne régler la réverbération que par CC91.

## 5. Essais à faire avant de coder

À faire sur le PC (Edge, `docs/checklist.md`) puis sur la tablette, avec le piano en USB, depuis la console :

1. **Notes reçues en USB** : écouter les entrées Web MIDI et vérifier que les notes, la vélocité et la pédale (CC64) du clavier arrivent, et sur quel canal.
2. **Multitimbral** : envoyer un patch différent sur les canaux 1, 2, 3, puis des notes sur chacun en même temps, pendant qu'on joue au clavier (canal 4). Vérifier que tout sonne ensemble, chacun avec son instrument.
3. **Sons Roland hors canal 4** : envoyer sur le canal 1 un patch Roland (Jazz Scat, Pipe Organ, Harpiness…) et vérifier ce qui sonne.
4. **Ambiance et autres canaux** : faire jouer des notes en boucle sur le canal 1, puis changer l'Ambiance (0 puis 10) : la réverbération du canal 1 change-t-elle ? Et le CC91 sur le canal 1 : quelle valeur ressemble à quelle Ambiance ?
5. **Effets par canal** : envoyer le preset Pad sur le canal 1 (CC71 à CC75, CC93) et le preset Sombre sur le canal 2 ; jouer les deux ensemble et vérifier que chacun garde son caractère.
6. **Volume par canal** : le CC11 (Expression) baisse-t-il bien le volume d'un canal sans toucher aux autres ?
7. **Réactivité de l'écran** (sur la tablette) : toucher un bouton de test au même instant qu'une touche du piano, une vingtaine de fois. L'application compare l'instant du toucher (`event.timeStamp`) et celui de la note reçue (même horloge) : on obtient le retard de l'écran et sa régularité. Sans rythme, la durée de la première boucle dépend de l'appui qui l'arrête et de celui qui la démarre (avec l'Auto Rec, s'il est activé, le départ tombe sur la première note) ; si le retard est régulier, il n'a pas d'effet sur la boucle.
8. **(Voie audio, pour mémoire)** : `navigator.mediaDevices.enumerateDevices()` liste-t-il une entrée audio Roland ? Enregistrer 5 s, réécouter. Jouer un son depuis la tablette pendant un enregistrement : se retrouve-t-il dans l'enregistrement ?

## 6. Première version

Une RC-505 mk2 **sans rythme ni effets de boucle**, avec plusieurs pistes et les réglages par défaut de l'appareil :

- **2 pistes au moins**, le nombre de pistes n'étant qu'un paramètre du code (5 sur la RC-505 mk2) ;
- pour chaque piste, comme sur l'appareil : un **gros bouton rond REC/PLAY**, un bouton **STOP**, un **curseur de volume**, un indicateur de position dans la boucle, et les couleurs d'état (rouge enregistrement, vert lecture, jaune superposition, éteint arrêtée) ;
- cycle du bouton rond : piste vide → Enregistrement → Lecture → Superposition → Lecture → Superposition… (REC ACTION par défaut) ;
- **Auto Rec** (désactivé par défaut, comme sur l'appareil) : une fois activé dans les réglages, le bouton rond met en attente (il clignote) et l'enregistrement démarre à la première note jouée. Désactivé, l'enregistrement démarre au toucher du bouton ;
- **superposition** en mode OVERDUB ; elle peut durer plusieurs tours, tout ce qui est joué s'ajoute ;
- **Undo / Redo** par piste (dernier enregistrement ou dernière superposition de la piste) ;
- **Clear** d'une piste ;
- **ALL START/STOP** ;
- **PLAY MODE MULTI** et **LOOP SYNC** (par défaut sur l'appareil) : toutes les pistes jouent ensemble, calées sur la boucle de la première piste enregistrée. Une piste relancée reprend à la position courante de la boucle ;
- **durée de la première boucle** : exactement le temps entre le départ (le toucher du bouton, ou la première note si l'Auto Rec est activé) et l'appui qui l'arrête, sans quantification, comme une RC-505 mk2 sans rythme. Les pistes suivantes se calent sur elle (QUANTIZE par défaut), selon le comportement de l'appareil (voir la réserve en fin de section 2) ;
- STOP immédiat, START immédiat (valeurs par défaut) ;
- disponible seulement quand le piano est branché en USB ;
- emplacement : une fenêtre ou un panneau accessible depuis l'onglet piano (idée de `docs/todo.md`).

Adaptations à l'écran tactile (pas de nouvelle fonction) :

- Undo/Redo et Clear peuvent être des boutons directs plutôt qu'un mode ou un appui long de 2 s, si l'essai sur scène montre que c'est plus sûr ; à décider en voyant l'écran ;
- les boutons réagissent **au contact du doigt** (`pointerdown`), pas au relâchement, et l'instant retenu est celui du toucher (`event.timeStamp`).

Intégration à l'application : le bouton d'arrêt d'urgence arrête aussi toutes les pistes.

Détails d'implémentation, à régler au moment du code : une note encore tenue quand la boucle recommence ; le retour au réglage de départ (instrument, effets) de chaque partie à chaque tour ; l'attribution des canaux aux pistes.

## 7. Plus tard : fonctions de la RC-505 mk2 non reprises en première version

Toutes existent sur la RC-505 mk2. À ajouter une par une, si le besoin se présente sur scène :

- passer à **5 pistes** (si les canaux et l'écran le permettent) ;
- **PLAY MODE SINGLE** (une piste à la fois, couplet / refrain) ;
- **rythme** joué par le piano (batterie GM2 sur le canal 10), avec tempo réglé ou tapé (TAP TEMPO), décompte, et quantification des limites de la boucle sur la mesure ;
- **STOP** en fondu ou en fin de tour, **START** en fondu ;
- **REPLACE** (mode de superposition), **REVERSE**, **1SHOT** ;
- **MARK BACK** (revenir à une superposition marquée) ;
- **effets de piste** ;
- **pédale externe** (la RC-505 mk2 accepte des pédales) : par exemple une pédale Bluetooth de tourne-page, vue comme un clavier par la tablette ;
- enregistrement audio (voie B).

## 8. Évolutions que seul le MIDI permet (idées, pas en première version)

Ces fonctions n'existent sur aucune loop station, parce qu'une loop station enregistre du son. Elles deviennent possibles parce que l'application enregistre des notes. Elles s'écartent de la règle de conception : à n'envisager qu'une fois le looper rodé, et en connaissance de cause.

- **Recaler les notes sur les temps** (quantification des notes, comme dans un séquenceur) : ramener chaque note sur le temps ou la croche le plus proche, en gardant sa durée, avec une force réglable (100 % = pile sur le temps, 50 % = à mi-chemin). Il faut un tempo : celui du rythme, s'il existe un jour (section 7), ou un tempo tapé. Les instants d'origine sont gardés, le recalage peut être annulé.

## 9. Écarté

- **Détection automatique du tempo à partir du jeu** : n'existe pas sur une loop station.
- **Réglage séparé des superpositions d'une même piste** (muet, volume, instrument) : n'existe pas, les superpositions se fondent dans la piste. Pour régler deux parties séparément, on les enregistre sur deux pistes.
- **Arrêt automatique au bout de N mesures** (réglage MEASURE) : il existe, mais l'utilisateur préfère arrêter lui-même.
- **Mémoires** : pas de conservation d'une séance à l'autre.
- **Anacrouse** (phrase qui commence avant le premier temps) : pas l'usage visé.
- **Bluetooth** : le looper est réservé à l'USB.

## Sources

- Boss RC-505 mk2, manuel d'utilisation (anglais) : https://static.roland.com/assets/media/pdf/RC-505mk2_eng03_W.pdf
- Boss RC-505 mk2, guide des paramètres (anglais) : https://static.roland.com/assets/media/pdf/RC-505mk2_Parameter_eng02_W.pdf
- Boss RC-500, manuels consultés d'abord (même logique d'enregistrement, 2 pistes, au pied) : https://static.roland.com/assets/media/pdf/RC-500_eng02_W.pdf, https://static.roland.com/assets/media/pdf/RC-500_Parameter_eng01_W.pdf
- Roland FP-30X : manuel et implémentation MIDI dans `docs/DOC_FP30X/`, essais dans `docs/fp30x-midi.md`.
