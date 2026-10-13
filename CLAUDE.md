# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PWA soundboard for live improv theater, used on stage on an Android tablet in Chrome. It drives a Roland FP-30X digital piano over MIDI (USB through Web MIDI, or BLE MIDI through Web Bluetooth), and it also plays audio clips through a Web Audio effects chain. Code comments, UI strings, docs and commit messages are in French.

Production: https://cestymour.github.io/fp30-midi-soundboard/ (GitHub Pages). History: the app was plain JS until 1.6.4 (tag `v1-vanilla`), then rewritten with Vite, TypeScript and Svelte without changing its behaviour (1.7.0). `docs/refonte.md` is the archived brief and log of that rewrite; it is finished and its rules no longer apply.

## Working rules

- **Production**: every push to `main` deploys, and the app is used on stage. Never merge into or push `main` without the user's explicit approval. The user does the `git push` themselves unless they explicitly allow it for one task.
- Small commits in French, in the style of the history, one commit per topic (one per bug fix).
- **Bugs**: a bug found along the way goes into `docs/bugs.md` first, with its diagnosis (scenario, cause, consequences, suggested fix). The user decides whether and when to fix it; don't fix it in passing. Update its status there when it is fixed.
- **Node**: run `source ~/.nvm/nvm.sh && nvm use` in the repo before any npm command. Node 24 is used only by this project: never change the nvm default (`nvm alias default`), which stays on Node 18 for the user's other projects.
- **Release**: bump `version` in `package.json` (see below), run `npm run typecheck`, `npm test`, `npm run build` and `tools/regression/run.sh`, check what changed on the tablet with `docs/checklist.md`, then tag the released commit `vX.Y.Z` (annotated) and push the tag: the regression tool uses the latest tag as its reference.

## Commands

Vite build, TypeScript (`strict`) in ES modules, Svelte 5 (runes) for the UI. Vitest for unit tests, no linter.

- Node version is pinned in `.nvmrc` (24 LTS; `vite-plugin-pwa` needs Node ≥ 20). See the Node rule above.
- `npm install` once, then `npm run dev` (dev server on http://localhost:5173/, no Service Worker).
- `npm run typecheck` runs `svelte-check --fail-on-warnings` on the app (`tsconfig.json`, DOM lib, `.ts` and `.svelte`), then `tsc` on `tsconfig.sw.json` (`src/sw.ts`, WebWorker lib) and `tsconfig.node.json` (`vite.config.ts`). Vite itself does not typecheck. Svelte warnings (unused CSS selector, a11y) fail the check: fix them, or add a `svelte-ignore` comment with the reason.
- `npm test` runs Vitest once (`*.test.ts` next to the code).
- `npm run build` builds to `dist/`, and `npm run preview` serves the build with the Service Worker (http://localhost:4173/). `vite.config.ts` uses `base: './'` because production is served under `/fp30-midi-soundboard/`.
- Deploy: every push to `main` runs `npm ci`, `npm run typecheck`, `npm test` and `npm run build`, then publishes `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). The Pages source must stay on « GitHub Actions » (with « Deploy from a branch », GitHub's own job overwrites the site with the raw sources). `gh` is not installed: follow a run through the public API (`https://api.github.com/repos/cestymour/fp30-midi-soundboard/actions/runs`) and check the site with `curl`.

## Releasing / cache invalidation

Nothing to bump by hand for caching. `src/sw.ts` is a Workbox Service Worker built by `vite-plugin-pwa` (`injectManifest`) and published as `sw.js` at the site root. The precache list and file revisions are generated at build time (HTML, JS, CSS, icons, `manifest.json`). The SW calls `skipWaiting()` and `clientsClaim()`: a new version takes over at the next app launch.

- Sounds (`/sounds/`): `CacheFirst` in the stable, unversioned cache `impro-audio`. On a miss the whole file is fetched without the `Range` header (a 206 can't be cached), and `RangeRequestsPlugin` then serves `<audio>` range requests from the cache.
- Images (`/images/`): `CacheFirst` in `impro-images`. Google Fonts: `impro-fonts-css` (StaleWhileRevalidate) and `impro-fonts` (CacheFirst).
- On activation, the SW migrates from the 1.6.x SW: it copies `impro-audio-*` entries into `impro-audio`, then deletes the `impro-app-*` and `impro-audio-*` caches. Keep that code (and `tools/regression/migration.mjs`) until every tablet has updated to 1.7.x; the user will say when.
- The SW is registered in `src/main.ts`, in production builds only.

The version shown in the About popup comes from `package.json` (`version`), injected at build time as `__APP_VERSION__` (see `vite.config.ts`). Bump it for each release so you can tell on the tablet which version is running.

## Testing

- Unit tests (`*.test.ts` next to the code): presets, MIDI bytes, timing, BLE parser, config ids, and playback (`src/audio/playback.test.ts`: fades and track disposal, with fake tracks in place of `<audio>` and Web Audio).
- `tools/regression/`: headless Chromium, no piano. `run.sh` compares `dist/` with a reference build, by default the latest `vX.Y.Z` tag (`REGRESSION_REF` to choose another, `v1-vanilla` included): screenshots, a 23-step interaction scenario, and the Service Worker update from 1.6.x and offline mode. For a CSS-only change, `tools/regression/styles.sh <reference build>` compares the computed style of every element (and `::before` / `::after`) between two builds, in about twenty UI states and at every media query breakpoint. See its README for the setup (Chromium, `playwright-core` outside the repo).
- `docs/checklist.md`: the manual checklist on the tablet, with the real piano, and how to serve the app to the tablet (`adb reverse`) or to a browser on the Windows host.

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

- `src/midi/midi.ts`: sending only. `sendMidi()` routes to the USB `STATE.midiOutput` when present, otherwise to BLE `STATE.bt`; `buildInstrumentPatchMessages()` (`pc` 1-based → 0-based), patch, volume, all-notes-off. Only BLE messages are logged to the console (`MIDI OUT (BT)`).
- `src/midi/connection.ts`: USB (Web MIDI) and BLE connection handling, `selectMidiConnection()`, `midiConnectionEvents` (`status`, `selection`, `outputs`). On the first Web MIDI access, `autoConnectUsbPiano()` connects to the first USB output whose name contains « piano » (the FP-30X shows up as « Roland Digital Piano »).
- `src/midi/bluetoothMIDI.ts`: the `BluetoothMIDI` class (a GATT write queue, plus a loopback of incoming notes to the piano). Connecting needs a user gesture (the browser's device picker), so a page reload loses the BLE connection.
- `src/midi/ble-midi-parser.ts`: BLE MIDI packet parser, an ES port of the `packets` part of skratchdot's `ble-midi` (the npm package itself is a Node CLI with native deps and is unusable in the browser).
- `src/audio/audio-engine.ts`: the `AudioEngine` class (a single Web Audio graph: EQ → filters → compressor → distortion → delay/reverb → master) and `MediaElementTrack`, exported as `AudioEngineAPI`. Every track must end with `dispose()`, which disconnects it from the graph.
- `src/audio/playback.ts`: `playSound(item)`, `stopSound`, `togglePlayPause`, `seekToRatio`, `setAudioVolume`, fades and the progress loop; `playbackEvents` (`play`, `stop`, `pause`, `resume`, `progress-start`, `progress`, `missing`). The current sound is `STATE.currentSoundItem` (an `AudioItem`, not a button). One fade at a time: a new fade cancels the running one. Switching sounds cuts the previous one dead, on purpose (the next sound must start at once, with its own fade-in).
- `src/audio/timing.ts`: pure time helpers (playback range from `start`/`end`, progress, seek time, `formatTime`).
- `src/fx/fx-presets.ts`: the single, pure preset logic shared by both FX popups (target values, clamp, active preset inference, neutral checks, interpolation). `src/fx/fx-animation.ts` animates values towards targets.
- `src/fx/midi-fx.ts`, `src/fx/audio-fx.ts`: the `*_FX_CONTROLS` arrays, `MIDI_FX_STATE`, and how a value is applied.

UI (Svelte 5). The `*.svelte.ts` modules hold the UI state in runes and the logic that is not tied to one component:

- `src/ui/fx-overlay.svelte.ts`: `FxOverlayController`, the state and logic of one FX popup (values, active preset, layout over the active grid, animations). `src/ui/fx-overlays.svelte.ts` creates the MIDI and audio controllers with only what differs (ids, data attributes, settings source, audio low-pass fix-up), plus `fxToolbar` (the Effets/Reset buttons state) and `resetAllFXEffects()`.
- `src/ui/transport.svelte.ts`: per-sound button state (`getSoundButtonState(item)`: progress, reset to 0 when the sound stops, transition, missing) and the transport bar text and fill; `bindPlaybackUI()` subscribes to `playbackEvents`.
- `src/ui/midi-ui.svelte.ts`: connection selects (one per MIDI panel) and the active instrument; `bindMidiConnectionUI()` subscribes to `midiConnectionEvents`.
- `src/ui/layout.svelte.ts`: active tab, orientation, `activateTab()`, and the button height equalization.

Components:

- `src/App.svelte`: header (tabs, settings button), one panel per tab, About popup, the two FX popups.
- `src/ui/FxOverlay.svelte`: the single generic FX popup, driven by its controller.
- `src/ui/components/`: `TabNav`, `Panel` (frame and controls bar shared by both panel types), `MidiPanel`, `AudioPanel`, `SoundButton`, `Transport` (play/pause, seek drag, time), `FxToolbar` (Effets/Reset), `VolumeControl` (its icon is derived from the shared volume, so it matches on every panel), `EmergencyStopButton`, `CategoryTitle`, `AboutPopup`.

Styles: `src/css/global.css` holds the variables, reset, page layout and the `.vol-slider` range input shared by the volume controls and the FX popups. Everything else is scoped in the components. Each rule family stays in a single component, in its original order (all `.sound-btn` rules are in `SoundButton.svelte`, including the animals-grid and column variants, through `:global(.animals-grid) .sound-btn`), so the cascade order is kept: Svelte adds the same specificity (one class) to every scoped rule. Rules for markup that is never rendered (`.paused`, `.fx-track`) are kept with `:global(...)`.

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
