# Checklist de non-régression

À passer sur la tablette (Chrome Android) avant chaque mise en production (push sur `main`), à la mesure du changement : tout pour une modification large, les points concernés pour un petit correctif. Vérifier chaque point en **paysage** et en **portrait**. L'outil `tools/regression` (Chromium headless, sans piano) complète cette liste, il ne la remplace pas.

- [ ] Chargement de l'app, onglets affichés, navigation entre onglets
- [ ] Connexion du piano en **USB** (Web MIDI) : connexion automatique au chargement si le piano est déjà branché (badge « ● USB »), puis sélection manuelle dans la liste
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

### Première mise à jour depuis `v1-vanilla` (1.6.x → 1.7.x)

À faire une fois sur chaque tablette où la v1 était installée, avant de vider quoi que ce soit ; à retirer de la liste quand toutes sont à jour (et le code de migration de `src/sw.ts` avec, voir `CLAUDE.md`) :

- [ ] Après le déploiement, rouvrir l'app (deux fois si besoin) : la popup « À propos » affiche la nouvelle version et « Service Worker : actif ✓ »
- [ ] DevTools à distance (`chrome://inspect` depuis le PC, tablette en USB) → Application → Cache Storage : plus aucun cache `impro-app-*` ni `impro-audio-*` ; présence de `workbox-precache-v2-…` et `impro-audio`
- [ ] Jouer quelques sons en ligne, passer en mode avion, relancer l'app : elle démarre et ces sons se relancent (y compris avec seek)

## Tester sur la tablette pendant le développement

Web MIDI, Web Bluetooth et les Service Workers exigent un contexte sécurisé (`localhost` ou HTTPS).

Le plus simple : la tablette branchée en USB au PC (débogage USB activé).

1. Sur le PC : `npm run dev` (port 5173) ou `npm run build && npm run preview` (port 4173, version construite, avec le Service Worker).
2. `adb reverse tcp:4173 tcp:4173` (ou `5173`) : la tablette ouvre `http://localhost:4173`, un contexte sécurisé, sans réglage de Chrome. Fonctionne aussi sous WSL, avec l'`adb` de Windows.
3. Pour inspecter la page : `chrome://inspect` dans Chrome ou Edge sur le PC.

Sans câble : `npm run dev -- --host` (ou `npm run preview -- --host`), puis sur la tablette ouvrir `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, y ajouter `http://<ip-du-pc>:5173` (et `http://<ip-du-pc>:4173` pour `preview`), puis relancer Chrome. Sous WSL, si la tablette n'arrive pas à joindre le serveur, vérifier la redirection de port Windows → WSL (ou le mode réseau `mirrored` de WSL) et le pare-feu Windows.

Sur le PC, avec le piano : le navigateur Windows joint directement `http://localhost:4173` servi par WSL ; le piano s'y connecte en USB ou en Bluetooth (la première connexion Bluetooth peut échouer sous Windows, réessayer). Ne pas recharger la page pendant un test en Bluetooth : la connexion serait perdue.
