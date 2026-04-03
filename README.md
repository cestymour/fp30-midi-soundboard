# 🎭 Piano Soundboard

Web-based PWA soundboard for live improv theater.  
Designed for tablet use (Android / Chrome), landscape orientation.

---

## 🚀 Try it live !

👉 **[Open the app — click here !](https://cestymour.github.io/fp30-midi-soundboard/)**

> Works best on Chrome (Android tablet or desktop). MIDI features require a connected instrument.

---

## What it does

- Instantly switch between instruments and sound effects during a live performance
- **MIDI instruments** — sends Bank Select + Program Change patches to a digital piano (Roland FP-30X or any GM2-compatible instrument)
- **Audio soundboard** — plays MP3 / OGG / WAV files with fade in/out and progress bar
- Organized by cinematic universe (classical, western, medieval, jazz, sci-fi, horror, world music...) and sound category (nature, animals, vehicles, human, SFX...)
- Auto-connects to the Roland FP-30X on page load
- Volume control directly from the interface (MIDI CC7 and audio volume, independently)

## How it works

### MIDI tabs
Click a button → the instrument or sound is selected on the piano → play the keys to produce the sound.  
**No sound is triggered automatically by the app** — the app configures the piano, the musician plays.

### Audio tabs
Click a button → the sound plays immediately from the device speakers.  
Click again → the sound fades out and stops.

## Notes

- GM2 sounds will work on any GM2-compatible instrument.
- Roland-specific sounds (Roland sound banks) are designed for the FP-30X and may not work as expected on other devices.
- Audio files are cached dynamically on first play. Before a show, play each sound once with an internet connection to ensure offline availability.

---

## Tech

- Vanilla JavaScript — no framework, no npm dependency
- Web MIDI API — USB wired connection
- Web Bluetooth API — BLE MIDI wireless connection
- Native `Audio` — audio playback
- Service Worker — app cache + dynamic audio cache
- GitHub Actions — automatic deployment to GitHub Pages

---

## Project structure

```
/
├── index.html                      # Entry point
├── style.css                       # Unified stylesheet
├── manifest.json                   # PWA manifest
├── sw.js                           # Service Worker
├── midi.config.js                  # MIDI instrument data (MIDI_TABS)
├── audio.config.js                 # Audio sound data (AUDIO_TABS)
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── js/
│   ├── app.js                      # Orchestrator: DOM, navigation, global state
│   ├── midi.js                     # MIDI logic (USB + Bluetooth)
│   ├── audio.js                    # Audio playback logic
│   ├── bluetoothMIDI.js            # BluetoothMIDI class (BLE MIDI)
│   └── ble-midi-parser.bundle.js   # BLE MIDI packet parser
└── sounds/
    └── *.mp3 / *.wav / *.ogg       # Audio files
```

---

## Configuration

### MIDI instruments — `midi.config.js`

Defines the `MIDI_TABS` variable — array of MIDI tabs, each containing categories and instruments:

```js
const MIDI_TABS = [
  {
    label: 'Instruments',   // Tab name
    icon: '🎹',             // Emoji displayed in the tab
    accent: '#7c9cff',      // Tab accent color
    categories: [
      {
        label: 'Classique', // Category name
        icon: '🎹',
        color: '#7c9cff',   // Category title color
        items: [
          {
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

### Audio sounds — `audio.config.js`

Defines the `AUDIO_TABS` variable — same structure as `MIDI_TABS`, items have a `file` field instead of MIDI fields:

```js
const AUDIO_TABS = [
  {
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    categories: [
      {
        label: 'Nature & Water',
        icon: '🌊',
        color: '#4cffaa',
        items: [
          {
            name: 'Forest',                     // Button label
            icon: '🌲',                          // Button emoji
            file: 'sounds/foret-oiseau.wav'     // Path to audio file
          },
        ]
      }
    ]
  }
];
```

---

## Requirements

- A browser supporting the Web MIDI API — **Chrome or Edge recommended**
- A Roland FP-30X (or any GM2-compatible instrument) connected via USB or Bluetooth

## Browser compatibility

| Feature | Required browser |
|---|---|
| Web MIDI API (USB) | Chrome / Edge (not Firefox, not Safari) |
| Web Bluetooth (BLE MIDI) | Chrome Android, Chrome Desktop |
| Audio (MP3 / OGG / WAV) | All modern browsers |
| PWA / Service Worker | Chrome, Edge, Safari 16.4+ |

> ⚠️ Optimized for **Chrome on Android**. MIDI features are not available on Firefox and Safari.

---

## Deployment

### GitHub Pages (automatic)

Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`).  
Every push to `main` automatically updates the live site.

**Initial setup:**
1. Go to **Settings → Pages** in your GitHub repository
2. Source: select **GitHub Actions**
3. Push to `main` → deployment triggers automatically

### Local development

No server required for basic development.  
Open `index.html` directly in Chrome.

> ⚠️ The Service Worker does not work over `file://`. To test the full PWA locally, use a minimal HTTP server:
> ```bash
> # Python
> python -m http.server 8080
> # Node.js
> npx serve .
> ```

---

## Updating the PWA cache

When you modify app files (HTML, CSS, JS), increment the cache versions in `sw.js`:

```js
const APP_CACHE   = 'impro-app-v2';    // ← increment
const AUDIO_CACHE = 'impro-audio-v2';  // ← increment if sounds changed
```

---

## Tested hardware

- **Piano**: Roland FP-30X
- **USB connection**: USB-B → USB-A cable
- **Bluetooth connection**: BLE MIDI (standard profile)
- **Tablet**: Android ~11 inches, Chrome

---

## License

MIT

---
---

# 🎭 Piano Soundboard — Version française

PWA soundboard pour spectacles d'improvisation théâtrale.  
Conçue pour une utilisation sur tablette Android (Chrome), en orientation paysage.

---

## 🚀 Essayer en ligne !

👉 **[Ouvrir l'application — cliquez ici !](https://cestymour.github.io/fp30-midi-soundboard/)**

> Fonctionne mieux sur Chrome (tablette Android ou ordinateur). Les fonctionnalités MIDI nécessitent un instrument connecté.

---

## Ce que ça fait

- Changer instantanément d'instrument ou d'effet sonore pendant un spectacle
- **Instruments MIDI** — envoie des patches Bank Select + Program Change vers un piano numérique (Roland FP-30X ou tout instrument compatible GM2)
- **Soundboard audio** — lecture de fichiers MP3 / OGG / WAV avec fondu d'entrée/sortie et barre de progression
- Organisé par univers cinématographique (classique, western, médiéval, jazz, SF, horreur, musique du monde...) et catégorie sonore (nature, animaux, véhicules, humain, effets spéciaux...)
- Connexion automatique au Roland FP-30X au chargement de la page
- Contrôle du volume directement depuis l'interface (MIDI CC7 et volume audio, indépendants)

## Comment ça fonctionne

### Onglets MIDI
Cliquer sur un bouton → l'instrument ou le son est sélectionné sur le piano → jouer les touches pour produire le son.  
**L'application ne déclenche aucun son automatiquement** — elle configure le piano, c'est le musicien qui joue.

### Onglets Audio
Cliquer sur un bouton → le son se joue immédiatement depuis les haut-parleurs de l'appareil.  
Cliquer à nouveau → le son s'éteint en fondu et s'arrête.

## Notes

- Les sons GM2 fonctionnent sur tout instrument compatible GM2.
- Les sons spécifiques Roland (banques Roland) sont conçus pour le FP-30X et peuvent ne pas fonctionner correctement sur d'autres appareils.
- Les fichiers audio sont mis en cache dynamiquement au premier clic. Avant un spectacle, jouer chaque son une fois avec une connexion internet pour garantir le fonctionnement hors ligne.

---

## Stack technique

- Vanilla JavaScript — aucun framework, aucune dépendance npm
- Web MIDI API — connexion USB filaire
- Web Bluetooth API — connexion Bluetooth MIDI (BLE MIDI)
- `Audio` natif — lecture audio
- Service Worker — cache app + cache audio dynamique
- GitHub Actions — déploiement automatique sur GitHub Pages

---

## Structure du projet

```
/
├── index.html                      # Point d'entrée
├── style.css                       # CSS unifié
├── manifest.json                   # Manifeste PWA
├── sw.js                           # Service Worker
├── midi.config.js                  # Données instruments MIDI (MIDI_TABS)
├── audio.config.js                 # Données sons audio (AUDIO_TABS)
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── js/
│   ├── app.js                      # Chef d'orchestre : DOM, navigation, état global
│   ├── midi.js                     # Logique MIDI (USB + Bluetooth)
│   ├── audio.js                    # Logique lecture audio
│   ├── bluetoothMIDI.js            # Classe BluetoothMIDI (BLE MIDI)
│   └── ble-midi-parser.bundle.js   # Parser paquet BLE MIDI
└── sounds/
    └── *.mp3 / *.wav / *.ogg       # Fichiers audio
```

---

## Configuration

### Instruments MIDI — `midi.config.js`

Définit la variable `MIDI_TABS` — tableau d'onglets MIDI, chacun contenant des catégories et des instruments :

```js
const MIDI_TABS = [
  {
    label: 'Instruments',   // Nom de l'onglet
    icon: '🎹',             // Emoji affiché dans l'onglet
    accent: '#7c9cff',      // Couleur de l'onglet
    categories: [
      {
        label: 'Classique', // Nom de la catégorie
        icon: '🎹',
        color: '#7c9cff',   // Couleur du titre de catégorie
        items: [
          {
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

### Sons audio — `audio.config.js`

Définit la variable `AUDIO_TABS` — même structure que `MIDI_TABS`, les items ont un champ `file` à la place des champs MIDI :

```js
const AUDIO_TABS = [
  {
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    categories: [
      {
        label: 'Nature & Eau',
        icon: '🌊',
        color: '#4cffaa',
        items: [
          {
            name: 'Forêt',                      // Nom affiché sur le bouton
            icon: '🌲',                          // Emoji du bouton
            file: 'sounds/foret-oiseau.wav'     // Chemin vers le fichier audio
          },
        ]
      }
    ]
  }
];
```

---

## Prérequis

- Un navigateur supportant la Web MIDI API — **Chrome ou Edge recommandé**
- Un Roland FP-30X (ou tout instrument compatible GM2) connecté en USB ou Bluetooth

## Compatibilité navigateurs

| Fonctionnalité | Navigateur requis |
|---|---|
| Web MIDI API (USB) | Chrome / Edge (pas Firefox, pas Safari) |
| Web Bluetooth (BLE MIDI) | Chrome Android, Chrome Desktop |
| Audio (MP3 / OGG / WAV) | Tous navigateurs modernes |
| PWA / Service Worker | Chrome, Edge, Safari 16.4+ |

> ⚠️ Optimisée pour **Chrome sur Android**. Les fonctionnalités MIDI ne sont pas disponibles sur Firefox et Safari.

---

## Déploiement

### GitHub Pages (automatique)

Le déploiement est géré par GitHub Actions (`.github/workflows/deploy.yml`).  
À chaque push sur la branche `main`, le site est automatiquement mis à jour.

**Configuration initiale :**
1. Aller dans **Settings → Pages** du dépôt GitHub
2. Source : sélectionner **GitHub Actions**
3. Pousser sur `main` → le déploiement se déclenche automatiquement

### En local

Aucun serveur requis pour le développement de base.  
Ouvrir `index.html` directement dans Chrome.

> ⚠️ Le Service Worker ne fonctionne pas en `file://`. Pour tester la PWA complète en local, utiliser un serveur HTTP minimal :
> ```bash
> # Python
> python -m http.server 8080
> # Node.js
> npx serve .
> ```

---

## Mise à jour du cache PWA

Quand tu modifies les fichiers app (HTML, CSS, JS), incrémenter les versions de cache dans `sw.js` :

```js
const APP_CACHE   = 'impro-app-v2';    // ← incrémenter
const AUDIO_CACHE = 'impro-audio-v2';  // ← incrémenter si les sons ont changé
```

---

## Matériel testé

- **Piano** : Roland FP-30X
- **Connexion USB** : câble USB-B → USB-A
- **Connexion Bluetooth** : BLE MIDI (profil standard)
- **Tablette** : Android ~11 pouces, Chrome

---

## Licence

MIT
