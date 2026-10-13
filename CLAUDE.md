# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PWA soundboard for live improv theater, used on an Android tablet in Chrome. It drives a Roland FP-30X digital piano over MIDI (USB through Web MIDI, or BLE MIDI through Web Bluetooth), and it also plays audio clips through a Web Audio effects chain. Code comments, UI strings and commit messages are in French.

## Refonte en cours

A technical, behaviour-preserving rewrite is in progress on the `refonte` branch. `REFONTE.md` is the work brief (phases, rules, progress in its « Suivi » section) and `docs/checklist.md` is the manual non-regression checklist. Never merge into or push `main` without the user's explicit approval: a push to `main` deploys to production, and the app is used on stage.

## Commands

Vite build, TypeScript (`strict`) in ES modules, no UI framework yet. Vitest for unit tests, no linter.

- Node version is pinned in `.nvmrc` (24 LTS; `vite-plugin-pwa` needs Node ≥ 20). The user's nvm default is still Node 18, so run `source ~/.nvm/nvm.sh && nvm use` in the repo before any npm command.
- `npm install` once, then `npm run dev` (dev server on http://localhost:5173/, no Service Worker).
- `npm run typecheck` runs `tsc` on three projects: `tsconfig.json` (app, DOM lib), `tsconfig.sw.json` (`src/sw.ts`, WebWorker lib) and `tsconfig.node.json` (`vite.config.ts`). Vite itself does not typecheck.
- `npm test` runs Vitest once (`*.test.ts` next to the code).
- `npm run build` builds to `dist/`, and `npm run preview` serves the build with the Service Worker. `vite.config.ts` uses `base: './'` because production is served under `/fp30-midi-soundboard/`.
- Deploy: every push to `main` runs `npm ci`, `npm run typecheck`, `npm test` and `npm run build`, then publishes `dist/` to GitHub Pages (`.github/workflows/deploy.yml`).

## Releasing / cache invalidation

Nothing to bump by hand for caching. `src/sw.ts` is a Workbox Service Worker built by `vite-plugin-pwa` (`injectManifest`) and published as `sw.js` at the site root. The precache list and file revisions are generated at build time (HTML, JS, CSS, icons, `manifest.json`).

- Sounds (`/sounds/`): `CacheFirst` in the stable, unversioned cache `impro-audio`. On a miss the whole file is fetched without the `Range` header (a 206 can't be cached), and `RangeRequestsPlugin` then serves `<audio>` range requests from the cache.
- Images (`/images/`): `CacheFirst` in `impro-images`. Google Fonts: `impro-fonts-css` (StaleWhileRevalidate) and `impro-fonts` (CacheFirst).
- On activation, the SW migrates from the pre-refonte SW: it copies `impro-audio-*` entries into `impro-audio`, then deletes the `impro-app-*` and `impro-audio-*` caches. Keep that code until every device has updated.
- The SW is registered in `src/main.ts`, in production builds only.

The version shown in the About popup comes from `package.json` (`version`), injected at build time as `__APP_VERSION__` (see `vite.config.ts`). Bump it for each release so you can tell on the tablet which version is running.

## Architecture

Entry point: `index.html` loads `src/main.ts`, which imports the CSS and calls `init()` from `src/app.ts`. Every dependency is an explicit `import`. There are no shared globals besides browser APIs.

- `src/sw.ts`: the Service Worker (see above).
- `public/`: static files copied as-is to the site root: `sounds/`, `images/`, icons, `manifest.json`. Config paths such as `file: 'sounds/x.mp3'` and `img: 'images/films/x.jpg'` are relative to the page, so they work both in dev and under the GitHub Pages sub-path.
- `src/types.ts`: shared types: config schema (`MidiTab`, `MidiItem`, `AudioTab`, `AudioItem`, `Category`), FX controls and presets (`FxControl`, `FxPreset`, `MidiFxKey`, `AudioFxKey`).
- `src/state.ts`: the shared mutable `STATE` object (typed `AppState`).
- `src/config/*.config.ts`: pure data exports (`MIDI_TABS`, `AUDIO_TABS`, `MIDI_FX_PRESETS`, `AUDIO_FX_PRESETS`). `config.test.ts` checks that every `id` is unique among its siblings.
- `src/midi/ble-midi-parser.ts`: BLE MIDI packet parser, an ES port of the `packets` part of skratchdot's `ble-midi` (the npm package itself is a Node CLI with native deps and is unusable in the browser).
- `src/midi/bluetoothMIDI.ts`: the `BluetoothMIDI` class (a GATT write queue, plus a loopback of incoming notes to the piano).
- `src/midi/midi.ts`: `sendMidi()` (routes to the USB `STATE.midiOutput` when present, otherwise to BLE `STATE.bt`), patch/volume/all-notes-off sending, and USB/BT connection handling.
- `src/audio/audio.ts`: the `AudioEngine` class (a single Web Audio graph: EQ → filters → compressor → distortion → delay/reverb → master), exported as `AudioEngineAPI`, plus playback, fades and the progress loop (`playSound`, `stopSound`).
- `src/fx/midi-fx-ui.ts`, `src/fx/audio-fx-ui.ts`: FX overlay popups.
- `src/app.ts`: builds all tabs and panels from the config data, handles tab navigation, transport and seek, the About popup and Wake Lock.
- `src/css/style.css`, `src/css/style.fx.css`: global styles.

Some modules import each other in a cycle (`app.ts` ↔ `audio/audio.ts` ↔ `fx/*`). That is fine as long as no module touches another module's exports at the top level, only inside functions. Keep it that way.

### Tabs

The DOM is generated entirely from `MIDI_TABS` / `AUDIO_TABS`: tab → categories → items. Tabs, categories and items all carry a required `id`: a short slug, unique among its siblings (tab ids are unique across MIDI and audio tabs), that must never change once set, even if the label, file or patch changes. Commented-out config entries keep their id too. New ids follow the same rule (Films tab items use the cover image file name). MIDI items carry `pc` (1-based, sent as `pc - 1`), `msb` (CC0) and `lsb` (CC32). Audio items carry `file` and optionally `img`, `start`, `end`, `catClass`. Tab-level options `cols` and `gridType: 'animals'` change the grid layout. The README documents the full config schema.

### FX overlays

`midi-fx-ui.ts` and `audio-fx-ui.ts` are deliberately parallel implementations with the same function shape (`build…Popup`, `apply…Preset`, `animate…ToValues`, `infer…PresetKey`, `reset…Effects`) and shared styles in `src/css/style.fx.css`. A change to one usually needs the mirror change in the other.

- Each overlay is driven by a `*_FX_CONTROLS` array. Each control has `key`, `min`/`max`/`step`, `neutral`, `read(settings)`, `apply(value)` and `formatValue`.
- A preset's `values` only lists the controls it changes. Every other control falls back to its `neutral` value, not to the slider's current position. `values: null` is the reset preset.
- The active preset is inferred from the current slider values (`infer…PresetKey`), so the highlight comes back after a tab switch or after the popup is closed and reopened.
- MIDI FX state is whatever the app last sent. It is never read back from the piano. Audio FX state is read from `AudioEngineAPI.getCurrentSettings()`.

### Layout

Button heights are equalized in JS (`equalizeMidiButtons` / `equalizeAudioButtons`, run by a `ResizeObserver`). Portrait mode rearranges the MIDI grids (`rearrangeMidiGrid`). The target device is an ~11" landscape/portrait tablet, so check both orientations.
