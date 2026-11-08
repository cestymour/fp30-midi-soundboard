# Checklist de non-régression

À passer sur la tablette (Chrome Android) avant chaque mise en production (push sur `main`), à la mesure du changement : tout pour une modification large, les points concernés pour un petit correctif. Vérifier chaque point en **paysage** et en **portrait**. L'outil `tools/regression` (Chromium headless, sans piano) complète cette liste, il ne la remplace pas.

- [ ] Chargement de l'app, onglets affichés, navigation entre onglets
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
- [ ] Popups FX : repères du neutre bien visibles de part et d'autre de chaque curseur ; après Reset, chaque poignée est posée pile sur ses repères, y compris en bout de course (Chorus, High-pass, Reverb, Delay, Low-pass)
- [ ] Barre des panneaux sur téléphone en paysage : « FX » et « RAZ » lisibles, rien de coupé (valeur du volume comprise)
- [ ] Popup FX MIDI : sliders, presets (Studio : son sec, brillant, notes courtes), reset, surbrillance du preset après fermeture/réouverture et après changement d'onglet ; les curseurs glissent sans à-coups pendant l'animation d'un preset, réverbération comprise ; nom sous chaque curseur lisible, sans valeur chiffrée
- [ ] Reset séparés : avec un preset piano et un preset audio actifs, le Reset d'un onglet MIDI ne remet à zéro que les effets piano (le Reset des onglets de sons reste allumé), et inversement
- [ ] Lecture de clips audio, y compris ceux avec `start` / `end`
- [ ] Fades, stop, lecture/pause, seek par clic et par glisser, barre de progression
- [ ] Popup FX audio : sliders, presets, reset, surbrillance, effet audible ; un son fort, volume à 100 %, réverbération, delay et basses à fond : pas de grésillement, et sans effet le son n'a pas changé
- [ ] Volume audio baissé juste après avoir lancé un son (pendant le fondu d'entrée) : le son reste au volume choisi
- [ ] Une longue série de sons (une cinquantaine) : chacun démarre
- [ ] Onglet animaux (`gridType: 'animals'`) et onglets avec `cols`
- [ ] Mode **paysage** et mode **portrait** : mise en page, hauteurs de boutons égalisées, réorganisation des grilles MIDI en portrait
- [ ] Dans un **onglet Chrome** (pas l'application installée) : la dernière rangée de boutons est entièrement visible, en paysage et en portrait
- [ ] Sur la **tablette de scène (Chrome 106)** : mêmes couleurs que sur un Chrome récent (tuiles teintées par famille, cadres des panneaux, boutons Effets/Reset, fond opaque des popups d'effets, barre de progression d'un son)
- [ ] Popup « À propos » et numéro de version ; « Stockage : protégé ✓ » dans l'application installée ; Wake Lock « actif ✓ » (et plus « actif » si la demande a échoué)
- [ ] « Plein écran » (popup À propos) dans un onglet Chrome : barres masquées ; le bouton devient « Quitter le plein écran » et en sort ; une sortie par le geste ou la touche Retour remet le bouton à « Plein écran »
- [ ] Sur un **téléphone en paysage** : popups des effets (chaque carte a son reset, son curseur et son nom entier) et popup À propos (défile, « Fermer » accessible)
- [ ] « ⬇ Télécharger tous les sons » : le compteur arrive au total (aujourd'hui « 68 / 68 sons, 36 / 36 images »), puis le bouton disparaît
- [ ] Wake Lock : l'écran ne se met pas en veille
- [ ] **Hors ligne** (mode avion) : l'app se lance, avec ses polices ; après « Télécharger tous les sons », un son jamais joué se lance ; « Mettre à jour l'application » affiche « Hors ligne : mise à jour impossible » et ne recharge rien
- [ ] Mise à jour : après un déploiement, la tablette récupère la nouvelle version ; si elle affiche encore l'ancien numéro, « ⟳ Mettre à jour l'application » passe au nouveau sans retélécharger les sons (le compteur hors ligne ne redescend pas)

## Tester sur la tablette pendant le développement

Web MIDI, Web Bluetooth et les Service Workers exigent un contexte sécurisé (`localhost` ou HTTPS).

Le plus simple : la tablette branchée en USB au PC (débogage USB activé).

1. Sur le PC : `npm run dev` (port 5173) ou `npm run build && npm run preview` (port 4173, version construite, avec le Service Worker).
2. `adb reverse tcp:4173 tcp:4173` (ou `5173`) : la tablette ouvre `http://localhost:4173`, un contexte sécurisé, sans réglage de Chrome. Fonctionne aussi sous WSL, avec l'`adb` de Windows.
3. Pour inspecter la page : `chrome://inspect` dans Chrome ou Edge sur le PC.

Sans câble : `npm run dev -- --host` (ou `npm run preview -- --host`), puis sur la tablette ouvrir `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, y ajouter `http://<ip-du-pc>:5173` (et `http://<ip-du-pc>:4173` pour `preview`), puis relancer Chrome. Sous WSL, si la tablette n'arrive pas à joindre le serveur, vérifier la redirection de port Windows → WSL (ou le mode réseau `mirrored` de WSL) et le pare-feu Windows.

Sur le PC, avec le piano : le navigateur Windows joint directement `http://localhost:4173` servi par WSL ; le piano s'y connecte en USB ou en Bluetooth (la première connexion Bluetooth peut échouer sous Windows, réessayer). Ne pas recharger la page pendant un test en Bluetooth : la connexion serait perdue.
