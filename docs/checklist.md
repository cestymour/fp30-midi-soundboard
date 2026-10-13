# Checklist de non-régression

À passer sur la tablette (Chrome Android) à la fin de chaque phase de la refonte (voir `REFONTE.md`), et avant chaque fusion dans `main`. Vérifier chaque point en **paysage** et en **portrait**.

- [ ] Chargement de l'app, onglets affichés, navigation entre onglets
- [ ] Connexion du piano en **USB** (Web MIDI) : sélection de l'entrée et de la sortie
- [ ] Connexion du piano en **Bluetooth** (BLE MIDI), y compris le loopback des notes jouées
- [ ] Sélection d'instruments : le bon son sur le piano (Program Change + Bank Select MSB/LSB)
- [ ] Volume MIDI, all-notes-off, bouton d'arrêt d'urgence
- [ ] Popup FX MIDI : sliders, presets, reset, surbrillance du preset après fermeture/réouverture et après changement d'onglet
- [ ] Lecture de clips audio, y compris ceux avec `start` / `end`
- [ ] Fades, stop, lecture/pause, seek par clic et par glisser, barre de progression
- [ ] Popup FX audio : sliders, presets, reset, surbrillance, effet audible
- [ ] Onglet animaux (`gridType: 'animals'`) et onglets avec `cols`
- [ ] Mode **paysage** et mode **portrait** : mise en page, hauteurs de boutons égalisées, réorganisation des grilles MIDI en portrait
- [ ] Popup « À propos » et numéro de version
- [ ] Wake Lock : l'écran ne se met pas en veille
- [ ] **Hors ligne** (mode avion) : l'app se lance, les sons déjà joués une fois se relancent
- [ ] Mise à jour : après un déploiement, la tablette récupère la nouvelle version

## Tester sur la tablette pendant le développement

Web MIDI, Web Bluetooth et les Service Workers exigent un contexte sécurisé (`localhost` ou HTTPS).

1. Sur le PC : `npm run dev -- --host` (ou `npm run build && npm run preview -- --host` pour tester la version construite).
2. Sur la tablette : ouvrir `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, y ajouter `http://<ip-du-pc>:5173` (et `http://<ip-du-pc>:4173` pour `preview`), puis relancer Chrome.

Sous WSL : si la tablette n'arrive pas à joindre le serveur, vérifier la redirection de port Windows → WSL (ou le mode réseau `mirrored` de WSL) et le pare-feu Windows.
