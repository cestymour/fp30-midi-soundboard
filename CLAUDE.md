# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PWA soundboard for live improv theater, used on an Android tablet in Chrome. It drives a Roland FP-30X digital piano over MIDI (USB through Web MIDI, or BLE MIDI through Web Bluetooth), and it also plays audio clips through a Web Audio effects chain. Code comments, UI strings and commit messages are in French.

## Refonte en cours

A technical, behaviour-preserving rewrite is in progress on the `refonte` branch. `REFONTE.md` is the work brief (phases, rules, progress in its « Suivi » section), `docs/checklist.md` is the manual non-regression checklist, and `docs/bugs.md` lists the bugs found along the way, with their diagnosis. Behaviour must not change during the rewrite: add newly found bugs to `docs/bugs.md` instead of fixing them. Never merge into or push `main` without the user's explicit approval: a push to `main` deploys to production, and the app is used on stage.

## Commands

Vite build, TypeScript (`strict`) in ES modules, Svelte 5 (runes) for the UI. Vitest for unit tests, no linter.

- Node version is pinned in `.nvmrc` (24 LTS; `vite-plugin-pwa` needs Node ≥ 20). The user's nvm default is still Node 18, so run `source ~/.nvm/nvm.sh && nvm use` in the repo before any npm command.
- `npm install` once, then `npm run dev` (dev server on http://localhost:5173/, no Service Worker).
- `npm run typecheck` runs `svelte-check --fail-on-warnings` on the app (`tsconfig.json`, DOM lib, `.ts` and `.svelte`), then `tsc` on `tsconfig.sw.json` (`src/sw.ts`, WebWorker lib) and `tsconfig.node.json` (`vite.config.ts`). Vite itself does not typecheck. Svelte warnings (unused CSS selector, a11y) fail the check: fix them, or add a `svelte-ignore` comment with the reason.
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

Entry point: `index.html` only holds `<div id="app">`. It loads `src/main.ts`, which imports the global CSS, subscribes the UI state to the engines' events, mounts `src/App.svelte`, then starts Wake Lock (`src/wake-lock.ts`), Bluetooth, Web MIDI and the Service Worker. Every dependency is an explicit `import`. There are no shared globals besides browser APIs.

- `src/sw.ts`: the Service Worker (see above).
- `public/`: static files copied as-is to the site root: `sounds/`, `images/`, icons, `manifest.json`. Config paths such as `file: 'sounds/x.mp3'` and `img: 'images/films/x.jpg'` are relative to the page, so they work both in dev and under the GitHub Pages sub-path.
- `src/types.ts`: shared types: config schema (`MidiTab`, `MidiItem`, `AudioTab`, `AudioItem`, `Category`), FX controls and presets (`FxControl`, `FxPreset`, `MidiFxKey`, `AudioFxKey`).
- `src/state.svelte.ts`: the shared `STATE` object, a class with `$state` fields (`AppState`). Objects compared by identity or owned by browser APIs (MIDI ports, BLE, tracks, the current `AudioItem`) use `$state.raw`, so they are never proxied.
- `src/config/tabs.ts`: `getMidiTabs()` / `getAudioTabs()`. Components never read `MIDI_TABS` / `AUDIO_TABS` directly: these functions are the single place to apply user preferences later (hidden tiles, order).
- `src/config/*.config.ts`: pure data exports (`MIDI_TABS`, `AUDIO_TABS`, `MIDI_FX_PRESETS`, `AUDIO_FX_PRESETS`). `config.test.ts` checks that every `id` is unique among its siblings.
- `src/events.ts`: `createEmitter()`, the small typed event emitter the engines use to notify the UI.

Engines (`src/midi/`, `src/audio/`, `src/fx/`) never touch the DOM and never import `src/ui/` or the Svelte components; the UI subscribes to their events. Keep it that way (the remaining browser APIs there are Web MIDI, Web Bluetooth, Web Audio, the `<audio>` element used for playback, and `requestAnimationFrame`).

- `src/midi/midi.ts`: sending only. `sendMidi()` routes to the USB `STATE.midiOutput` when present, otherwise to BLE `STATE.bt`; `buildInstrumentPatchMessages()` (`pc` 1-based → 0-based), patch, volume, all-notes-off.
- `src/midi/connection.ts`: USB (Web MIDI) and BLE connection handling, `selectMidiConnection()`, `midiConnectionEvents` (`status`, `selection`, `outputs`).
- `src/midi/bluetoothMIDI.ts`: the `BluetoothMIDI` class (a GATT write queue, plus a loopback of incoming notes to the piano).
- `src/midi/ble-midi-parser.ts`: BLE MIDI packet parser, an ES port of the `packets` part of skratchdot's `ble-midi` (the npm package itself is a Node CLI with native deps and is unusable in the browser).
- `src/audio/audio-engine.ts`: the `AudioEngine` class (a single Web Audio graph: EQ → filters → compressor → distortion → delay/reverb → master) and `MediaElementTrack`, exported as `AudioEngineAPI`.
- `src/audio/playback.ts`: `playSound(item)`, `stopSound`, `togglePlayPause`, `seekToRatio`, `setAudioVolume`, fades and the progress loop; `playbackEvents` (`play`, `stop`, `pause`, `resume`, `progress-start`, `progress`, `missing`). The current sound is `STATE.currentSoundItem` (an `AudioItem`, not a button).
- `src/audio/timing.ts`: pure time helpers (playback range from `start`/`end`, progress, seek time, `formatTime`).
- `src/fx/fx-presets.ts`: the single, pure preset logic shared by both FX popups (target values, clamp, active preset inference, neutral checks, interpolation). `src/fx/fx-animation.ts` animates values towards targets.
- `src/fx/midi-fx.ts`, `src/fx/audio-fx.ts`: the `*_FX_CONTROLS` arrays, `MIDI_FX_STATE`, and how a value is applied.
UI (Svelte 5). The `*.svelte.ts` modules hold the UI state in runes and the logic that is not tied to one component:

- `src/ui/fx-overlay.svelte.ts`: `FxOverlayController`, the state and logic of one FX popup (values, active preset, layout over the active grid, animations). `src/ui/fx-overlays.svelte.ts` creates the MIDI and audio controllers with only what differs (ids, data attributes, settings source, audio low-pass fix-up), plus `fxToolbar` (the Effets/Reset buttons state) and `resetAllFXEffects()`.
- `src/ui/transport.svelte.ts`: per-sound button state (`getSoundButtonState(item)`: progress, transition, missing) and the transport bar text and fill; `bindPlaybackUI()` subscribes to `playbackEvents`.
- `src/ui/midi-ui.svelte.ts`: connection selects (one per MIDI panel) and the active instrument; `bindMidiConnectionUI()` subscribes to `midiConnectionEvents`.
- `src/ui/layout.svelte.ts`: active tab, orientation, `activateTab()`, and the button height equalization.

Components:

- `src/App.svelte`: header (tabs, settings button), one panel per tab, About popup, the two FX popups.
- `src/ui/FxOverlay.svelte`: the single generic FX popup, driven by its controller.
- `src/ui/components/`: `TabNav`, `Panel` (frame and controls bar shared by both panel types), `MidiPanel`, `AudioPanel`, `SoundButton`, `Transport` (play/pause, seek drag, time), `FxToolbar` (Effets/Reset), `VolumeControl`, `EmergencyStopButton`, `CategoryTitle`, `AboutPopup`.

Styles: `src/css/global.css` holds the variables, reset, page layout and the `.vol-slider` range input shared by the volume controls and the FX popups. Everything else is scoped in the components. Each rule family stays in a single component, in its original order (all `.sound-btn` rules are in `SoundButton.svelte`, including the animals-grid and column variants, through `:global(.animals-grid) .sound-btn`), so the cascade is unchanged: Svelte adds the same specificity (one class) to every scoped rule. Rules for markup that is never rendered (`.paused`, `.fx-track`) are kept with `:global(...)`.
- Tests: `*.test.ts` next to the code (presets, MIDI bytes, timing, BLE parser, config ids).
- `tools/regression/`: automated comparison against `v1-vanilla` in headless Chromium (screenshots, a 23-step interaction scenario, Service Worker update and offline). See its README. Run it after each phase. For a CSS-only change, `tools/regression/styles.sh <reference build>` compares the computed style of every element (and `::before` / `::after`) between two builds, in about twenty UI states and at every media query breakpoint.

### Tabs

The UI is generated entirely from `MIDI_TABS` / `AUDIO_TABS` (through `src/config/tabs.ts`): tab → categories → items. `{#each}` blocks are keyed by `id`. Tabs, categories and items all carry a required `id`: a short slug, unique among its siblings (tab ids are unique across MIDI and audio tabs), that must never change once set, even if the label, file or patch changes. Commented-out config entries keep their id too. New ids follow the same rule (Films tab items use the cover image file name). MIDI items carry `pc` (1-based, sent as `pc - 1`), `msb` (CC0) and `lsb` (CC32). Audio items carry `file` and optionally `img`, `start`, `end`, `catClass`. Tab-level options `cols` and `gridType: 'animals'` change the grid layout. The README documents the full config schema.

### FX overlays

Both popups (MIDI and audio) are the same `FxOverlay.svelte` component, each driven by an `FxOverlayController`. Only `src/ui/fx-overlays.svelte.ts` holds what differs.

- Each popup is driven by a `*_FX_CONTROLS` array. Each control has `key`, `min`/`max`/`step`, `neutral`, `read(settings)`, `apply(value)` and `formatValue`.
- A preset's `values` only lists the controls it changes. Every other control falls back to its `neutral` value, not to the slider's current position. `values: null` is the reset preset.
- The active preset is inferred from the current slider values (`inferActiveFxPresetKey`), so the highlight comes back after a tab switch or after the popup is closed and reopened.
- MIDI FX state is whatever the app last sent (`MIDI_FX_STATE`). It is never read back from the piano. Audio FX state is read from `AudioEngineAPI.getCurrentSettings()`.

### Layout

Button heights are equalized in JS (`equalizeMidiButtons` / `equalizeAudioButtons` in `src/ui/layout.svelte.ts`, run on tab change, orientation change and by a `ResizeObserver`): they measure the rendered grid, and a pure CSS version would not render identically. In portrait, `MidiPanel.svelte` redistributes the categories over 2 columns. The target device is an ~11" landscape/portrait tablet, so check both orientations.
