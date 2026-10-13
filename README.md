# 🎭 Piano Soundboard

> 🇬🇧 [English](#english) · 🇫🇷 [Français](#français)

---

<a id="english"></a>

## 🇬🇧 English

Web-based PWA soundboard for live improv theater.  
Designed for tablet use (Android / Chrome), landscape & portrait orientation.

---

### 🚀 Try it live!

👉 **[Open the app — click here!](https://cestymour.github.io/fp30-midi-soundboard/)**

> Works best on Chrome (Android tablet or desktop). MIDI features require a connected instrument.

---

### What it does

- Instantly switch between instruments and sound effects during a live performance
- **MIDI instruments** — sends Bank Select + Program Change patches to a digital piano (Roland FP-30X or any GM2-compatible instrument)
- **Audio soundboard** — plays MP3 / OGG / WAV files with fade in/out and progress bar
- **Film soundboard** — movie themes organized by genre with cover images
- **Animal soundboard** — 4×8 color-coded grid with category accents
- Organized by cinematic universe (classical, western, medieval, jazz, sci-fi, horror, world music...) and sound category (nature, animals, vehicles, human, SFX...)
- Auto-connects to the Roland FP-30X on page load
- Volume control directly from the interface (MIDI CC7 and audio volume, independently)
- **Emergency Stop** — All Notes Off button to silence the piano instantly
- **Wake Lock** — prevents screen sleep during a performance
- **Responsive layout** — automatic grid reorganization in portrait mode
- **About popup** — shows Service Worker and Wake Lock status, cache reset button
- **Live audio FX mixer** — full overlay on the audio panel to shape the sound in real time (EQ, filters, tempo, delay, reverb) while a clip plays or before the next one; presets with smooth transitions, global reset, and quick per-control recall
- **MIDI piano FX** — on every MIDI tab, **Effets** / **Reset** opens an overlay (same layout language as the audio mixer) over the instrument grid; sliders send standard MIDI CCs to the connected piano (reverb, chorus, cutoff, resonance, attack, release, decay) via `sendMidi()` in `src/midi/midi.ts`. Both FX popups share one implementation (the `src/ui/FxOverlay.svelte` component, preset logic in `src/fx/fx-presets.ts`). Slider positions reflect what the app last sent, not a read-back from the instrument.

### How it works

#### MIDI tabs
Click a button → the instrument or sound is selected on the piano → play the keys to produce the sound.  
**No sound is triggered automatically by the app** — the app configures the piano, the musician plays.

Use **Effets** / **Reset** in the MIDI panel header to open the piano FX overlay or reset those CCs to their default values.

#### Audio tabs
Click a button → the sound plays immediately from the device speakers.  
Click again → the sound fades out and stops.

Use **Effets** / **Reset** in the audio panel header to open the FX overlay (over the sound grid) or restore default processing. Processing runs through the Web Audio chain in `src/audio/audio-engine.ts`; the overlay is the shared FX popup (`src/ui/FxOverlay.svelte`).

### Notes

- GM2 sounds will work on any GM2-compatible instrument.
- Roland-specific sounds (Roland sound banks) are designed for the FP-30X and may not work as expected on other devices.
- MIDI piano FX use common CC numbers (e.g. 91 reverb, 93 chorus, 74 brightness/cutoff); interpretation depends on the connected instrument (tuned for Roland FP-30X).
- Audio files are cached dynamically on first play. Before a show, play each sound once with an internet connection to ensure offline availability.

---

### Tech

- TypeScript (strict, ES modules), Svelte 5 (runes) — user interface
- Vite — dev server and static build; Vitest — unit tests
- Web MIDI API — USB wired connection
- Web Bluetooth API — BLE MIDI wireless connection
- Web Audio API + `<audio>` element — audio playback and effects chain
- Service Worker (Workbox, `vite-plugin-pwa`) — precached app + audio cached on first play
- Wake Lock API — prevents screen dimming
- GitHub Actions — automatic deployment to GitHub Pages

---

### Project structure

```
/
├── index.html                      # Entry point (loads src/main.ts)
├── vite.config.ts                  # Vite + PWA configuration
├── package.json                    # Scripts, dependencies, app version
├── tools/regression/               # Automated comparison with v1 (headless Chromium, see its README)
├── src/
│   ├── main.ts                     # Entry: global styles, mounts App, MIDI, Wake Lock, Service Worker
│   ├── App.svelte                  # Header, one panel per tab, About and FX popups
│   ├── state.svelte.ts             # Shared state (STATE, Svelte runes)
│   ├── wake-lock.ts                # Keeps the screen on
│   ├── types.ts                    # Shared types (config schema, FX controls and presets)
│   ├── events.ts                   # Small typed event emitter (engines → UI)
│   ├── sw.ts                       # Service Worker (Workbox)
│   ├── config/                     # Data + FX presets
│   │   ├── midi.config.ts          # MIDI instrument data (MIDI_TABS)
│   │   ├── audio.config.ts         # Audio sound data (AUDIO_TABS)
│   │   ├── midi-fx.config.ts       # MIDI FX overlay presets (MIDI_FX_PRESETS)
│   │   ├── audio-fx.config.ts      # Audio FX overlay presets (AUDIO_FX_PRESETS)
│   │   └── tabs.ts                 # Config access for the UI (getMidiTabs, getAudioTabs)
│   ├── midi/                       # MIDI engine (no DOM)
│   │   ├── midi.ts                 # Sending: USB/BT routing, patch, volume, all notes off
│   │   ├── connection.ts           # USB (Web MIDI) and Bluetooth connection
│   │   ├── bluetoothMIDI.ts        # BluetoothMIDI class (BLE MIDI)
│   │   └── ble-midi-parser.ts      # BLE MIDI packet parser
│   ├── audio/                      # Audio engine (no DOM)
│   │   ├── audio-engine.ts         # Web Audio effects chain
│   │   ├── playback.ts             # Play, stop, pause, seek, fades, progress
│   │   └── timing.ts               # Time helpers (range, progress, M:SS)
│   ├── fx/                         # FX logic (no DOM)
│   │   ├── fx-presets.ts           # Shared preset logic (targets, active preset, clamp)
│   │   ├── fx-animation.ts         # Slider animation towards targets
│   │   ├── midi-fx.ts              # MIDI FX controls (CC)
│   │   └── audio-fx.ts             # Audio FX controls
│   ├── ui/                         # User interface (Svelte)
│   │   ├── FxOverlay.svelte        # Generic FX popup (MIDI and audio)
│   │   ├── fx-overlay.svelte.ts    # FX popup state and logic (controller)
│   │   ├── fx-overlays.svelte.ts   # MIDI and audio FX popups, Effets/Reset state
│   │   ├── transport.svelte.ts     # Sound buttons and transport bar state
│   │   ├── midi-ui.svelte.ts       # MIDI connection selects, active instrument
│   │   ├── layout.svelte.ts        # Active tab, orientation, button heights
│   │   └── components/             # TabNav, Panel, MidiPanel, AudioPanel, SoundButton, Transport…
│   └── css/
│       └── global.css              # Variables, reset, shared slider (other styles are in the components)
└── public/                         # Copied as-is to the site root
    ├── manifest.json               # PWA manifest
    ├── favicon.ico, apple-touch-icon.png, pwa-*.png
    ├── images/films/*.jpg          # Cover images for film soundboard
    └── sounds/                     # Audio files (*.mp3 / *.wav / *.ogg, animaux/, films/)
```

---

### Configuration

All tab data and FX preset strips live under **`src/config/`**, as ES module exports imported by the app.

#### MIDI instruments — `src/config/midi.config.ts`

Exports `MIDI_TABS` — array of MIDI tabs, each containing categories and instruments:

```js
export const MIDI_TABS: MidiTab[] = [
  {
    id: 'instruments',      // Stable identifier (see below)
    label: 'Instruments',   // Tab name
    icon: '🎹',             // Emoji displayed in the tab
    accent: '#7c9cff',      // Tab accent color
    cols: 7,                // Number of columns (optional, default: 5)
    categories: [
      {
        id: 'classique',
        label: 'Classique', // Category name
        icon: '🎹',
        color: '#7c9cff',   // Category title color
        items: [
          {
            id: 'piano',
            name: 'Piano',  // Button label
            icon: '🎹',     // Button emoji
            pc: 1,          // Program Change (1-128, musical notation)
            msb: 0,         // Bank Select MSB (CC0)
            lsb: 68,        // Bank Select LSB (CC32)
            title: 'Roland => Concert Piano(GP1)' // Tooltip
          },
        ]
      }
    ]
  }
];
```

#### Audio sounds — `src/config/audio.config.ts`

Exports `AUDIO_TABS` — same structure as `MIDI_TABS`, with audio-specific fields:

```js
export const AUDIO_TABS: AudioTab[] = [
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    // Optional layout options:
    // cols: 3,              // Multi-column layout (Films tab)
    // gridType: 'animals',  // Special grid layout (Animals tab)
    categories: [
      {
        id: 'nature-eau',
        label: 'Nature & Water',
        icon: '🌊',
        color: '#4cffaa',
        items: [
          {
            id: 'foret',
            name: 'Forest',                     // Button label
            icon: '🌲',                          // Button emoji (or image path)
            file: 'sounds/foret-oiseau.wav',    // Path to audio file (under public/)
            // Optional fields:
            // img: 'images/films/cover.jpg',   // Cover image (overrides icon)
            // start: 12.5,                     // Start time in seconds
            // end: 45.0,                       // End time in seconds
            // title: 'Custom tooltip',         // Tooltip text
            // catClass: 'animaux-ferme',       // CSS class for category color
          },
        ]
      }
    ]
  }
];
```

#### Stable identifiers (`id`)

Every tab, category and item has a required `id`: a short, readable slug (`'nature'`, `'faune'`, `'pluie'`), unique among its siblings (tab ids are unique across MIDI and audio tabs). **Never change an `id` once it exists**, even if the label, file or patch changes: it will be used to store user preferences (hidden or reordered tiles). `npm test` checks uniqueness. The types are in `src/types.ts`.

#### FX preset strips — `src/config/midi-fx.config.ts` and `src/config/audio-fx.config.ts`

Preset buttons for the MIDI and audio FX overlays. Each file exports an array — `MIDI_FX_PRESETS` and `AUDIO_FX_PRESETS` — of objects `{ key, icon, text, values }`. Use `values: null` for the reset row; otherwise `values` maps control keys to numbers (MIDI: e.g. `reverb`, `chorus`, `cutoff`, `resonance`, `attack`, `release`, `decay`; audio: e.g. `bass`, `mid`, `treble`, `lowPass`, `highPass`, `reverb`, `delay`, `speed`). Any control **not** listed in `values` uses that control’s **neutral** default from `MIDI_FX_CONTROLS` / `AUDIO_FX_CONTROLS` in `src/fx/midi-fx.ts` / `src/fx/audio-fx.ts` (not the slider’s current position).

#### Special tab types

**Multi-column layout** (e.g. Films tab):
```js
{
  label: 'Films',
  cols: 3,  // Items arranged in 3 columns with category headers
  // ...
}
```

**Animal grid** (fixed 4×8 landscape / 8×4 portrait):
```js
{
  label: 'Animaux',
  gridType: 'animals',  // Enables the special animal grid
  // ...
}
```

---

### Requirements

- A browser supporting the Web MIDI API — **Chrome or Edge recommended**
- A Roland FP-30X (or any GM2-compatible instrument) connected via USB or Bluetooth

### Browser compatibility

| Feature | Required browser |
|---|---|
| Web MIDI API (USB) | Chrome / Edge (not Firefox, not Safari) |
| Web Bluetooth (BLE MIDI) | Chrome Android, Chrome Desktop |
| Audio (MP3 / OGG / WAV) | All modern browsers |
| PWA / Service Worker | Chrome, Edge, Safari 16.4+ |
| Wake Lock API | Chrome, Edge |

> ⚠️ Optimized for **Chrome on Android**. MIDI features are not available on Firefox and Safari.

---

### Deployment

#### GitHub Pages (automatic)

Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`).  
Every push to `main` installs dependencies (`npm ci`), runs the type check and the tests, builds the site with Vite and publishes `dist/`.

**Initial setup:**
1. Go to **Settings → Pages** in your GitHub repository
2. Source: select **GitHub Actions**
3. Push to `main` → deployment triggers automatically

#### Local development

Requires Node.js (version in `.nvmrc`; with nvm: `nvm use`).

```bash
npm install        # once
npm run dev        # dev server on http://localhost:5173/ (no Service Worker)
npm run typecheck  # TypeScript + Svelte check (app, Service Worker, Vite config)
npm test           # unit tests (Vitest)
npm run build      # production build in dist/
npm run preview    # serves dist/ (with the Service Worker)
```

To test on a tablet on the same network, add `-- --host` and see `docs/checklist.md`.

---

### Releasing and PWA cache

Nothing to do by hand: the Service Worker precache list and file revisions are generated at build time, so installed clients pick up the new version after each deployment. Audio files are kept in a stable cache (`impro-audio`) and are not downloaded again after an update.

The version number shown in the About popup is the `version` field of `package.json`: bump it for each release, to tell which version runs on the tablet.

---

### Tested hardware

- **Piano**: Roland FP-30X
- **USB connection**: USB-B → USB-A cable
- **Bluetooth connection**: BLE MIDI (standard profile)
- **Tablet**: Android ~11 inches, Chrome

---

### License

MIT

---
---

<a id="français"></a>

## 🇫🇷 Français

PWA soundboard pour spectacles d'improvisation théâtrale.  
Conçue pour une utilisation sur tablette Android (Chrome), en orientation paysage et portrait.

---

### 🚀 Essayer en ligne !

👉 **[Ouvrir l'application — cliquez ici !](https://cestymour.github.io/fp30-midi-soundboard/)**

> Fonctionne mieux sur Chrome (tablette Android ou ordinateur). Les fonctionnalités MIDI nécessitent un instrument connecté.

---

### Ce que ça fait

- Changer instantanément d'instrument ou d'effet sonore pendant un spectacle
- **Instruments MIDI** — envoie des patches Bank Select + Program Change vers un piano numérique (Roland FP-30X ou tout instrument compatible GM2)
- **Soundboard audio** — lecture de fichiers MP3 / OGG / WAV avec fondu d'entrée/sortie et barre de progression
- **Soundboard films** — thèmes de films organisés par genre avec images de couverture
- **Soundboard animaux** — grille 4×8 avec couleurs par catégorie d'animal
- Organisé par univers cinématographique (classique, western, médiéval, jazz, SF, horreur, musique du monde...) et catégorie sonore (nature, animaux, véhicules, humain, effets spéciaux...)
- Connexion automatique au Roland FP-30X au chargement de la page
- Contrôle du volume directement depuis l'interface (MIDI CC7 et volume audio, indépendants)
- **Arrêt d'urgence** — bouton All Notes Off pour couper le piano instantanément
- **Wake Lock** — empêche la mise en veille de l'écran pendant le spectacle
- **Layout responsive** — réorganisation automatique de la grille en mode portrait
- **Popup À propos** — affiche le statut du Service Worker et du Wake Lock, bouton de reset du cache
- **Mixeur d’effets audio en direct** — grande popup sur le panneau audio pour façonner le son en temps réel (égalisation, filtres, tempo, delay, reverb) pendant la lecture ou avant le morceau suivant ; presets avec transitions en douceur, reset global et rappel rapide par curseur
- **Effets piano MIDI** — sur chaque onglet MIDI, **Effets** / **Reset** ouvre une popup (même logique visuelle que le mixeur audio) au-dessus de la grille d’instruments ; les curseurs envoient des Control Changes MIDI standards vers le piano connecté (reverb, chorus, cutoff, résonance, attaque, relâchement, decay) via `sendMidi()` dans `src/midi/midi.ts`. Les deux popups d’effets partagent une seule implémentation (le composant `src/ui/FxOverlay.svelte`, logique des presets dans `src/fx/fx-presets.ts`). Les positions des curseurs reflètent ce que l’application a envoyé en dernier, pas une relecture depuis l’instrument.

### Comment ça fonctionne

#### Onglets MIDI
Cliquer sur un bouton → l'instrument ou le son est sélectionné sur le piano → jouer les touches pour produire le son.  
**L'application ne déclenche aucun son automatiquement** — elle configure le piano, c'est le musicien qui joue.

Les boutons **Effets** / **Reset** de la barre du panneau MIDI ouvrent la popup d’effets piano ou rétablissent les CC concernés à leurs valeurs par défaut.

#### Onglets Audio
Cliquer sur un bouton → le son se joue immédiatement depuis les haut-parleurs de l'appareil.  
Cliquer à nouveau → le son s'éteint en fondu et s'arrête.

Les boutons **Effets** / **Reset** de la barre du panneau audio ouvrent la popup d’effets (au-dessus de la grille de sons) ou rétablissent le traitement par défaut. Le traitement passe par la chaîne Web Audio dans `src/audio/audio-engine.ts` ; la popup est la popup d’effets commune (`src/ui/FxOverlay.svelte`).

### Notes

- Les sons GM2 fonctionnent sur tout instrument compatible GM2.
- Les sons spécifiques Roland (banques Roland) sont conçus pour le FP-30X et peuvent ne pas fonctionner correctement sur d'autres appareils.
- Les effets piano MIDI utilisent des numéros de CC courants (ex. 91 reverb, 93 chorus, 74 cutoff / brilliance) ; l’effet réel dépend de l’instrument connecté (réglages pensés pour le Roland FP-30X).
- Les fichiers audio sont mis en cache dynamiquement au premier clic. Avant un spectacle, jouer chaque son une fois avec une connexion internet pour garantir le fonctionnement hors ligne.

---

### Stack technique

- TypeScript (strict, modules ES), Svelte 5 (runes) — interface
- Vite — serveur de développement et build statique ; Vitest — tests unitaires
- Web MIDI API — connexion USB filaire
- Web Bluetooth API — connexion Bluetooth MIDI (BLE MIDI)
- Web Audio API + élément `<audio>` — lecture audio et chaîne d'effets
- Service Worker (Workbox, `vite-plugin-pwa`) — app précachée + sons mis en cache au premier clic
- Wake Lock API — empêche la mise en veille de l'écran
- GitHub Actions — déploiement automatique sur GitHub Pages

---

### Structure du projet

```
/
├── index.html                      # Point d'entrée (charge src/main.ts)
├── vite.config.ts                  # Configuration Vite + PWA
├── package.json                    # Scripts, dépendances, version de l'app
├── tools/regression/               # Comparaison automatique avec la v1 (Chromium headless, voir son README)
├── src/
│   ├── main.ts                     # Entrée : styles globaux, montage d'App, MIDI, Wake Lock, Service Worker
│   ├── App.svelte                  # En-tête, un panneau par onglet, popups À propos et effets
│   ├── state.svelte.ts             # État partagé (STATE, runes Svelte)
│   ├── wake-lock.ts                # Garde l'écran allumé
│   ├── types.ts                    # Types partagés (schéma de config, contrôles et presets FX)
│   ├── events.ts                   # Petit émetteur d'événements typé (moteurs → interface)
│   ├── sw.ts                       # Service Worker (Workbox)
│   ├── config/                     # Données + presets FX
│   │   ├── midi.config.ts          # Données instruments MIDI (MIDI_TABS)
│   │   ├── audio.config.ts         # Données sons audio (AUDIO_TABS)
│   │   ├── midi-fx.config.ts       # Presets popup effets MIDI (MIDI_FX_PRESETS)
│   │   ├── audio-fx.config.ts      # Presets popup effets audio (AUDIO_FX_PRESETS)
│   │   └── tabs.ts                 # Accès à la config pour l'interface (getMidiTabs, getAudioTabs)
│   ├── midi/                       # Moteur MIDI (sans DOM)
│   │   ├── midi.ts                 # Envoi : routage USB/BT, patch, volume, all notes off
│   │   ├── connection.ts           # Connexion USB (Web MIDI) et Bluetooth
│   │   ├── bluetoothMIDI.ts        # Classe BluetoothMIDI (BLE MIDI)
│   │   └── ble-midi-parser.ts      # Parser paquet BLE MIDI
│   ├── audio/                      # Moteur audio (sans DOM)
│   │   ├── audio-engine.ts         # Chaîne d'effets Web Audio
│   │   ├── playback.ts             # Lecture, stop, pause, seek, fondus, progression
│   │   └── timing.ts               # Calculs de temps (plage, progression, M:SS)
│   ├── fx/                         # Logique des effets (sans DOM)
│   │   ├── fx-presets.ts           # Logique commune des presets (cibles, preset actif, clamp)
│   │   ├── fx-animation.ts         # Animation des curseurs vers les cibles
│   │   ├── midi-fx.ts              # Contrôles effets MIDI (CC)
│   │   └── audio-fx.ts             # Contrôles effets audio
│   ├── ui/                         # Interface (Svelte)
│   │   ├── FxOverlay.svelte        # Popup d'effets générique (MIDI et audio)
│   │   ├── fx-overlay.svelte.ts    # État et logique d'une popup d'effets (contrôleur)
│   │   ├── fx-overlays.svelte.ts   # Popups effets MIDI et audio, état Effets/Reset
│   │   ├── transport.svelte.ts     # État des boutons de sons et de la barre de transport
│   │   ├── midi-ui.svelte.ts       # Listes de connexion MIDI, instrument actif
│   │   ├── layout.svelte.ts        # Onglet actif, orientation, hauteur des boutons
│   │   └── components/             # TabNav, Panel, MidiPanel, AudioPanel, SoundButton, Transport…
│   └── css/
│       └── global.css              # Variables, reset, curseur partagé (le reste est dans les composants)
└── public/                         # Copié tel quel à la racine du site
    ├── manifest.json               # Manifeste PWA
    ├── favicon.ico, apple-touch-icon.png, pwa-*.png
    ├── images/films/*.jpg          # Images de couverture pour le soundboard films
    └── sounds/                     # Fichiers audio (*.mp3 / *.wav / *.ogg, animaux/, films/)
```

---

### Configuration

Les données d’onglets et les bandeaux de presets FX sont dans **`src/config/`**, sous forme d’exports de modules ES importés par l’app.

#### Instruments MIDI — `src/config/midi.config.ts`

Exporte `MIDI_TABS` — tableau d'onglets MIDI, chacun contenant des catégories et des instruments :

```js
export const MIDI_TABS: MidiTab[] = [
  {
    id: 'instruments',      // Identifiant stable (voir plus bas)
    label: 'Instruments',   // Nom de l'onglet
    icon: '🎹',             // Emoji affiché dans l'onglet
    accent: '#7c9cff',      // Couleur de l'onglet
    cols: 7,                // Nombre de colonnes (optionnel, défaut : 5)
    categories: [
      {
        id: 'classique',
        label: 'Classique', // Nom de la catégorie
        icon: '🎹',
        color: '#7c9cff',   // Couleur du titre de catégorie
        items: [
          {
            id: 'piano',
            name: 'Piano',  // Nom affiché sur le bouton
            icon: '🎹',     // Emoji du bouton
            pc: 1,          // Program Change (1-128, notation musicale)
            msb: 0,         // Bank Select MSB (CC0)
            lsb: 68,        // Bank Select LSB (CC32)
            title: 'Roland => Concert Piano(GP1)' // Tooltip
          },
        ]
      }
    ]
  }
];
```

#### Sons audio — `src/config/audio.config.ts`

Exporte `AUDIO_TABS` — même structure que `MIDI_TABS`, avec des champs spécifiques audio :

```js
export const AUDIO_TABS: AudioTab[] = [
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    // Options de layout optionnelles :
    // cols: 3,              // Affichage multi-colonnes (onglet Films)
    // gridType: 'animals',  // Grille spéciale (onglet Animaux)
    categories: [
      {
        id: 'nature-eau',
        label: 'Nature & Eau',
        icon: '🌊',
        color: '#4cffaa',
        items: [
          {
            id: 'foret',
            name: 'Forêt',                      // Nom affiché sur le bouton
            icon: '🌲',                          // Emoji (ou chemin vers image)
            file: 'sounds/foret-oiseau.wav',    // Chemin vers le fichier audio (dans public/)
            // Champs optionnels :
            // img: 'images/films/cover.jpg',   // Image de couverture (remplace icon)
            // start: 12.5,                     // Temps de départ en secondes
            // end: 45.0,                       // Temps de fin en secondes
            // title: 'Tooltip personnalisé',   // Texte du tooltip
            // catClass: 'animaux-ferme',       // Classe CSS pour couleur de catégorie
          },
        ]
      }
    ]
  }
];
```

#### Identifiants stables (`id`)

Chaque onglet, catégorie et tuile a un `id` obligatoire : un slug court et lisible (`'nature'`, `'faune'`, `'pluie'`), unique parmi ses frères (les id d’onglets sont uniques entre onglets MIDI et audio). **Ne jamais modifier un `id` existant**, même si le libellé, le fichier ou le patch changent : il servira à enregistrer des préférences utilisateur (tuiles masquées ou réordonnées). `npm test` vérifie l’unicité. Les types sont dans `src/types.ts`.

#### Bandeaux de presets FX — `src/config/midi-fx.config.ts` et `src/config/audio-fx.config.ts`

Boutons de preset des popups d’effets MIDI et audio. Chaque fichier exporte un tableau — `MIDI_FX_PRESETS` et `AUDIO_FX_PRESETS` — d’objets `{ key, icon, text, values }`. `values: null` correspond à la ligne Reset ; sinon `values` associe chaque clé de contrôle à un nombre (MIDI : ex. `reverb`, `chorus`, `cutoff`, `resonance`, `attack`, `release`, `decay` ; audio : ex. `bass`, `mid`, `treble`, `lowPass`, `highPass`, `reverb`, `delay`, `speed`). Tout contrôle **absent** de `values` prend la valeur **neutre** définie dans `MIDI_FX_CONTROLS` / `AUDIO_FX_CONTROLS` de `src/fx/midi-fx.ts` / `src/fx/audio-fx.ts` (pas la position actuelle du curseur).

#### Types d'onglets spéciaux

**Layout multi-colonnes** (ex : onglet Films) :
```js
{
  label: 'Films',
  cols: 3,  // Items répartis en 3 colonnes avec en-têtes de catégorie
  // ...
}
```

**Grille animaux** (4×8 fixe en paysage / 8×4 en portrait) :
```js
{
  label: 'Animaux',
  gridType: 'animals',  // Active la grille spéciale animaux
  // ...
}
```

---

### Prérequis

- Un navigateur supportant la Web MIDI API — **Chrome ou Edge recommandé**
- Un Roland FP-30X (ou tout instrument compatible GM2) connecté en USB ou Bluetooth

### Compatibilité navigateurs

| Fonctionnalité | Navigateur requis |
|---|---|
| Web MIDI API (USB) | Chrome / Edge (pas Firefox, pas Safari) |
| Web Bluetooth (BLE MIDI) | Chrome Android, Chrome Desktop |
| Audio (MP3 / OGG / WAV) | Tous navigateurs modernes |
| PWA / Service Worker | Chrome, Edge, Safari 16.4+ |
| Wake Lock API | Chrome, Edge |

> ⚠️ Optimisée pour **Chrome sur Android**. Les fonctionnalités MIDI ne sont pas disponibles sur Firefox et Safari.

---

### Déploiement

#### GitHub Pages (automatique)

Le déploiement est géré par GitHub Actions (`.github/workflows/deploy.yml`).  
À chaque push sur la branche `main`, le workflow installe les dépendances (`npm ci`), lance la vérification TypeScript et les tests, construit le site avec Vite et publie `dist/`.

**Configuration initiale :**
1. Aller dans **Settings → Pages** du dépôt GitHub
2. Source : sélectionner **GitHub Actions**
3. Pousser sur `main` → le déploiement se déclenche automatiquement

#### En local

Nécessite Node.js (version dans `.nvmrc` ; avec nvm : `nvm use`).

```bash
npm install        # une fois
npm run dev        # serveur de dev sur http://localhost:5173/ (sans Service Worker)
npm run typecheck  # vérification TypeScript + Svelte (app, Service Worker, config Vite)
npm test           # tests unitaires (Vitest)
npm run build      # build de production dans dist/
npm run preview    # sert dist/ (avec le Service Worker)
```

Pour tester sur une tablette du même réseau, ajouter `-- --host` et voir `docs/checklist.md`.

---

### Publier une version et cache PWA

Rien à faire à la main : la liste des fichiers précachés par le Service Worker et leurs révisions sont générées au build, donc les appareils installés récupèrent la nouvelle version après chaque déploiement. Les sons sont dans un cache stable (`impro-audio`) et ne sont pas retéléchargés après une mise à jour.

Le numéro de version affiché dans la popup « À propos » est le champ `version` de `package.json` : l'incrémenter à chaque publication, pour savoir quelle version tourne sur la tablette.

---

### Matériel testé

- **Piano** : Roland FP-30X
- **Connexion USB** : câble USB-B → USB-A
- **Connexion Bluetooth** : BLE MIDI (profil standard)
- **Tablette** : Android ~11 pouces, Chrome

---

### Licence

MIT
