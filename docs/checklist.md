# Checklist de non-régression

À passer sur la tablette (Chrome Android) avant chaque mise en production (push sur `main`), à la mesure du changement : tout pour une modification large, les points concernés pour un petit correctif. Vérifier chaque point en **paysage** et en **portrait**. L'outil `tools/regression` (Chromium headless, sans piano) complète cette liste, il ne la remplace pas.

- [ ] Chargement de l'app, onglets affichés, navigation entre onglets
- [ ] Barre d'onglets : jamais de défilement ; en rétrécissant, libellés complets, puis marges réduites, puis emoji seuls (paysage, portrait, téléphone) ; l'onglet actif est teinté de sa couleur (violet piano, vert sons, jaune musiques) ; ♫ et l'engrenage dans des ronds orange et bleu, et un appui au bord du carré, hors du rond, ouvre bien la popup
- [ ] Connexion du piano en **USB** (Web MIDI) : connexion automatique au chargement si le piano est déjà branché (badge « ● USB »), puis sélection manuelle dans la liste
- [ ] USB : câble débranché en cours d'usage → badge « Non connecté » ; rebranché → reconnexion automatique, instrument et effets renvoyés
- [ ] Connexion du piano en **Bluetooth** (BLE MIDI)
- [ ] Bluetooth : piano éteint puis rallumé en cours d'usage → badge « ◌ BT… », puis reconnexion seule (moins de 20 s) avec l'instrument, les effets et la réverbération d'avant ; piano laissé éteint → « BT perdu », puis « ᛒ <nom du piano> » dans la liste reconnecte sans sélecteur
- [ ] Bluetooth : après un rechargement de la page, la liste propose « ᛒ <nom du piano> », sans s'y connecter toute seule ; le choisir s'y reconnecte sans sélecteur (si Chrome sait retrouver l'appareil) ou ouvre le sélecteur avec ce seul piano ; « ᛒ Autre appareil Bluetooth… » ouvre le sélecteur complet
- [ ] Instrument choisi **avant** la connexion : il est bien joué une fois le piano connecté
- [ ] Son du clavier actif (ne **pas** faire Function + fa le plus grave) : un instrument choisi dans l'app est joué par les touches, sans le piano en double, en USB comme en Bluetooth ; accord tenu puis relâché avec un orgue : aucune note ne reste tenue
- [ ] Effets piano : la réverbération (Ambiance, 0 à 10) s'entend en USB comme en Bluetooth ; en USB, Chrome demande une fois l'autorisation SysEx (« contrôler entièrement les appareils MIDI ») : l'accepter
- [ ] Sélection d'instruments : le bon son sur le piano (Program Change + Bank Select MSB/LSB)
- [ ] Volume MIDI, bouton d'arrêt d'urgence (coupe tout de suite, réverbération comprise, même pédale enfoncée)
- [ ] Popups FX : le reset ↺ de chaque curseur au-dessus du curseur ; repères du neutre bien visibles de part et d'autre de chaque curseur ; après Reset, chaque poignée est posée pile sur ses repères, y compris en bout de course (Chorus, High-pass, Reverb, Delay, Low-pass)
- [ ] Barre des panneaux (onglets piano, musiques et sons), en paysage, en portrait et sur un téléphone en paysage : Effets, Reset, volume et stop bien placés, rien ne déborde ni n'est coupé
- [ ] Popup FX MIDI : sliders, presets (Studio : son sec, brillant, notes courtes), reset, surbrillance du preset après fermeture/réouverture et après changement d'onglet ; les curseurs glissent sans à-coups pendant l'animation d'un preset, réverbération comprise ; nom sous chaque curseur lisible, sans valeur chiffrée
- [ ] Reset séparés : avec un preset piano et un preset audio actifs, le Reset d'un onglet MIDI ne remet à zéro que les effets piano (le Reset des onglets de sons reste allumé), et inversement
- [ ] Lecture des musiques (onglets musiques) et des sons (onglets sons), y compris ceux avec `start` / `end`
- [ ] Musiques : fades, stop, lecture/pause, seek par clic et par glisser, barre de progression ; une musique lancée dans Films coupe celle de Musiques
- [ ] Sons : une musique en cours, puis plusieurs sons d'Animaux et de Bruits par-dessus : la musique continue, les sons s'entendent ensemble, sans fondu ; un son recliqué repart par-dessus lui-même (double flèche sur la tuile, progression du dernier lancé) ; « Couper les sons » coupe tous les sons et laisse la musique ; l'arrêt d'urgence coupe tout
- [ ] Sons : premier clic sur un son jamais joué depuis le lancement de l'appli, délai acceptable ; les suivants partent tout de suite ; neuf sons longs en même temps : pas de saturation, le 9e part
- [ ] Deux volumes séparés (sons, musiques) ; les effets audio ne touchent que la musique
- [ ] Musique de transition : bouton ♫ dans le coin haut gauche, sur tous les onglets, sans pousser d'onglet hors de l'écran (paysage et portrait) ; un clic ouvre la popup sans rien lancer, et ♫ devient un bouton play (double clic : la musique part, et ne s'arrête pas aussitôt) ; un bouton de moment la lance et coupe tout ce qui jouait (musique, sons, notes tenues au piano) ; ordre des moments 0, 1, 2…, 1, 2… avec le prévu en couleur et plus large ; pendant la lecture, ♫ devient un carré stop ; carré stop et « Arrêter » l'arrêtent en fondu ; le carré stop ferme la popup, « Arrêter » la laisse ouverte ; la popup ne change jamais de taille ; popup ouverte, tout le fond est voilé, en-tête compris, sauf ♫ / ▶ / ■, et un appui hors de la popup (sur un onglet aussi) la ferme sans changer d'onglet ; sur un téléphone en paysage, elle tient sans défilement ; choix et moment prévu gardés après un rechargement ; changer de musique ramène au 0 ; son volume ne touche pas celui des musiques, et les effets audio ne s'y appliquent pas ; une tuile d'un onglet musiques la coupe ; « ✨ Clarté Studio » change le son de la transition aussitôt, même en lecture, sans toucher aux effets des onglets, et reste allumé après un rechargement
- [ ] Popup FX audio : sliders, presets, reset, surbrillance, effet audible ; un son fort, volume à 100 %, réverbération, delay et basses à fond : pas de grésillement, et sans effet le son n'a pas changé
- [ ] Volume des musiques baissé juste après avoir lancé une musique (pendant le fondu d'entrée) : elle reste au volume choisi
- [ ] Une longue série de sons (une cinquantaine) : chacun démarre
- [ ] Onglet animaux (`gridType: 'animals'`) et onglets avec `cols`
- [ ] Dessins SVG des onglets et des tuiles (`svg` dans la config) : affichés à la taille des emojis voisins, visibles sur le fond sombre, jamais en carré vide ; en lecture, ils laissent la place au carré stop ou à la double flèche
- [ ] Mode **paysage** et mode **portrait** : mise en page, hauteurs de boutons égalisées, réorganisation des grilles MIDI en portrait
- [ ] Dans un **onglet Chrome** (pas l'application installée) : la dernière rangée de boutons est entièrement visible, en paysage et en portrait
- [ ] Sur la **tablette de scène (Chrome 106)** : mêmes couleurs que sur un Chrome récent (tuiles teintées par famille, cadres des panneaux, couleur de chaque type d'onglet, boutons Effets/Reset, fond opaque des popups d'effets, barre de progression d'un son, double flèche d'un son en cours)
- [ ] Popup « Paramètres » et numéro de version ; pastilles vertes dans l'application installée : « Écran toujours allumé : oui » (« non » en orange si la demande a échoué), « Stockage : protégé » ; le bouton « Plein écran » est le plus visible de la popup
- [ ] « Plein écran » (popup Paramètres) dans un onglet Chrome : barres masquées ; le bouton devient « Quitter le plein écran » et en sort ; une sortie par le geste ou la touche Retour remet le bouton à « Plein écran »
- [ ] Sur un **téléphone en paysage et en portrait** : popups des effets (chaque carte a son curseur et son nom entier) et popup Paramètres (défile ; la croix ✕ en haut à droite et un appui hors de la popup la ferment)
- [ ] « ⬇ Télécharger tous les sons » : le compteur arrive au total (sons et images), puis le bouton disparaît ; s'il restait d'anciens fichiers, le message donne la place libérée (« … Mo libérés »)
- [ ] Son remplacé sous le même nom (après un déploiement qui en modifie un) : le compteur des sons redescend d'un fichier ; avant « Télécharger tous les sons », en mode avion, le son joue encore (ancienne version) ; après, la nouvelle version joue
- [ ] Wake Lock : l'écran ne se met pas en veille
- [ ] **Hors ligne** (mode avion) : l'app se lance, avec ses polices ; après « Télécharger tous les sons », une musique et un son jamais joués se lancent ; « Mettre à jour l'application » affiche « Hors ligne : mise à jour impossible » et ne recharge rien
- [ ] Mise à jour : après un déploiement, la tablette récupère la nouvelle version ; si elle affiche encore l'ancien numéro, « ⟳ Mettre à jour l'application » passe au nouveau sans retélécharger les sons (le compteur hors ligne ne redescend que pour les sons et images modifiés)

## Tester sur la tablette pendant le développement

Web MIDI, Web Bluetooth et les Service Workers exigent un contexte sécurisé (`localhost` ou HTTPS).

Le plus simple : la tablette branchée en USB au PC (débogage USB activé).

1. Sur le PC : `npm run dev` (port 5173) ou `npm run build && npm run preview` (port 4173, version construite, avec le Service Worker).
2. `adb reverse tcp:4173 tcp:4173` (ou `5173`) : la tablette ouvre `http://localhost:4173`, un contexte sécurisé, sans réglage de Chrome.
3. Pour inspecter la page : `chrome://inspect` dans Chrome ou Edge sur le PC.

Sans câble : `npm run dev -- --host` (ou `npm run preview -- --host`), puis sur la tablette ouvrir `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, y ajouter `http://<ip-du-pc>:5173` (et `http://<ip-du-pc>:4173` pour `preview`), puis relancer Chrome. Si la tablette n'arrive pas à joindre le serveur, vérifier le pare-feu Windows (port 5173 ou 4173).

Sur le PC, avec le piano : Chrome ou Edge ouvre `http://localhost:5173` (ou `4173`) ; le piano s'y connecte en USB ou en Bluetooth (la première connexion Bluetooth peut échouer sous Windows, réessayer). Ne pas recharger la page pendant un test en Bluetooth : la connexion serait perdue.
