# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PWA soundboard for live improv theater, used on an Android tablet in Chrome. It drives a Roland FP-30X digital piano over MIDI (USB through Web MIDI, or BLE MIDI through Web Bluetooth), and it also plays audio clips through a Web Audio effects chain. Code comments, UI strings and commit messages are in French.

## Refonte en cours

A technical, behaviour-preserving rewrite is in progress on the `refonte` branch. `REFONTE.md` is the work brief (phases, rules, progress in its « Suivi » section) and `docs/checklist.md` is the manual non-regression checklist. Never merge into or push `main` without the user's explicit approval: a push to `main` deploys to production, and the app is used on stage.

## Commands

Vite build (Node ≥ 18), vanilla JS in ES modules. No linter and no test suite yet.

- `npm install` once, then `npm run dev` (dev server on http://localhost:5173/).
- `npm run build` builds to `dist/`, and `npm run preview` serves the build. `vite.config.js` uses `base: './'` because production is served under `/fp30-midi-soundboard/`.
- Deploy: every push to `main` publishes to GitHub Pages (`.github/workflows/deploy.yml`). **During phase 1 this workflow still publishes the repo root, which no longer works: do not merge into `main` before phase 2 is done.**

## Releasing / cache invalidation

The version shown in the About popup comes from `package.json` (`version`), injected at build time as `__APP_VERSION__` (see `vite.config.js`).

The old root `sw.js` + `version.js` are still in the repo but are no longer registered or deployed (phase 1). Phase 2 replaces them with a `vite-plugin-pwa` Service Worker.

## Architecture

Entry point: `index.html` loads `src/main.js`, which imports the CSS and calls `init()` from `src/app.js`. Every dependency is an explicit `import`. There are no shared globals besides browser APIs.

- `public/`: static files copied as-is to the site root: `sounds/`, `images/`, icons, `manifest.json`. Config paths such as `file: 'sounds/x.mp3'` and `img: 'images/films/x.jpg'` are relative to the page, so they work both in dev and under the GitHub Pages sub-path.
- `src/state.js`: the shared mutable `STATE` object.
- `src/config/*.config.js`: pure data exports (`MIDI_TABS`, `AUDIO_TABS`, `MIDI_FX_PRESETS`, `AUDIO_FX_PRESETS`).
- `src/midi/ble-midi-parser.js`: BLE MIDI packet parser, an ES port of the `packets` part of skratchdot's `ble-midi` (the npm package itself is a Node CLI with native deps and is unusable in the browser).
- `src/midi/bluetoothMIDI.js`: the `BluetoothMIDI` class (a GATT write queue, plus a loopback of incoming notes to the piano).
- `src/midi/midi.js`: `sendMidi()` (routes to the USB `STATE.midiOutput` when present, otherwise to BLE `STATE.bt`), patch/volume/all-notes-off sending, and USB/BT connection handling.
- `src/audio/audio.js`: the `AudioEngine` class (a single Web Audio graph: EQ → filters → compressor → distortion → delay/reverb → master), exported as `AudioEngineAPI`, plus playback, fades and the progress loop (`playSound`, `stopSound`).
- `src/fx/midi-fx-ui.js`, `src/fx/audio-fx-ui.js`: FX overlay popups.
- `src/app.js`: builds all tabs and panels from the config data, handles tab navigation, transport and seek, the About popup and Wake Lock.
- `src/css/style.css`, `src/css/style.fx.css`: global styles.

Some modules import each other in a cycle (`app.js` ↔ `audio/audio.js` ↔ `fx/*`). That is fine as long as no module touches another module's exports at the top level, only inside functions. Keep it that way.

### Tabs

The DOM is generated entirely from `MIDI_TABS` / `AUDIO_TABS`: tab → categories → items. MIDI items carry `pc` (1-based, sent as `pc - 1`), `msb` (CC0) and `lsb` (CC32). Audio items carry `file` and optionally `img`, `start`, `end`, `catClass`. Tab-level options `cols` and `gridType: 'animals'` change the grid layout. The README documents the full config schema.

### FX overlays

`midi-fx-ui.js` and `audio-fx-ui.js` are deliberately parallel implementations with the same function shape (`build…Popup`, `apply…Preset`, `animate…ToValues`, `infer…PresetKey`, `reset…Effects`) and shared styles in `src/css/style.fx.css`. A change to one usually needs the mirror change in the other.

- Each overlay is driven by a `*_FX_CONTROLS` array. Each control has `key`, `min`/`max`/`step`, `neutral`, `read(settings)`, `apply(value)` and `formatValue`.
- A preset's `values` only lists the controls it changes. Every other control falls back to its `neutral` value, not to the slider's current position. `values: null` is the reset preset.
- The active preset is inferred from the current slider values (`infer…PresetKey`), so the highlight comes back after a tab switch or after the popup is closed and reopened.
- MIDI FX state is whatever the app last sent. It is never read back from the piano. Audio FX state is read from `AudioEngineAPI.getCurrentSettings()`.

### Layout

Button heights are equalized in JS (`equalizeMidiButtons` / `equalizeAudioButtons`, run by a `ResizeObserver`). Portrait mode rearranges the MIDI grids (`rearrangeMidiGrid`). The target device is an ~11" landscape/portrait tablet, so check both orientations.
