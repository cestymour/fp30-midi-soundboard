# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PWA soundboard for live improv theater, used on an Android tablet in Chrome. It drives a Roland FP-30X digital piano over MIDI (USB through Web MIDI, or BLE MIDI through Web Bluetooth), and it also plays audio clips through a Web Audio effects chain. Code comments, UI strings and commit messages are in French.

## Commands

There is no build step, no package manager, no linter and no test suite. Everything is vanilla JS loaded by plain `<script>` tags.

- Run locally: `python -m http.server 8080` from the repo root (on Windows, use `start-local.bat`), then open http://localhost:8080/.
- Opening `index.html` over `file://` partly works, but the Service Worker is not registered, and `AudioEngine` disables `MediaElementSource` (`canUseMediaElementSource`), so the audio FX chain cannot be tested that way. Use HTTP.
- Deploy: every push to `main` publishes the repo root as-is to GitHub Pages (`.github/workflows/deploy.yml`).

## Releasing / cache invalidation

`version.js` defines `APP_VERSION`. `sw.js` imports it with `importScripts` and builds the cache names `impro-app-${APP_VERSION}` and `impro-audio-${APP_VERSION}` from it. **Bump `APP_VERSION` whenever app files change**, or installed clients keep serving the old cached files. (The README still says to edit the cache names in `sw.js` by hand. That is outdated.)

When adding, removing or renaming a JS/CSS/config file, update both the `<script>`/`<link>` tags in `index.html` and the `APP_ASSETS` precache list in `sw.js`. The two lists must stay in sync. Audio files under `sounds/` are not precached. They are cached on first fetch.

## Architecture

No modules: every file shares the global scope, so **script order in `index.html` is the dependency order**:

1. `version.js`
2. `config/*.config.js`: pure data globals (`MIDI_TABS`, `AUDIO_TABS`, `MIDI_FX_PRESETS`, `AUDIO_FX_PRESETS`)
3. `js/ble-midi-parser.bundle.js` → `js/bluetoothMIDI.js`: the `BluetoothMIDI` class (a GATT write queue, plus a loopback of incoming notes to the piano)
4. `js/midi.js`: `sendMidi()` (routes to the USB `STATE.midiOutput` when present, otherwise to BLE `STATE.bt`), patch/volume/all-notes-off sending, and USB/BT connection handling
5. `js/audio.js`: the `AudioEngine` class (a single Web Audio graph: EQ → filters → compressor → distortion → delay/reverb → master), exposed as `window.AudioEngineAPI`, plus playback, fades and the progress loop (`playSound`, `stopSound`)
6. `js/midi-fx-ui.js`, `js/audio-fx-ui.js`: FX overlay popups
7. `js/app.js`: defines the shared mutable `STATE` object, builds all tabs and panels from the config data, handles tab navigation, transport and seek, the About popup and Wake Lock, then calls `init()` at the end of the file

`STATE` is declared in `app.js`, which loads last, but the earlier files reference it inside their function bodies. That works because those functions are only called after `app.js` has run. Keep this property: don't access `STATE` at the top level of earlier scripts.

### Tabs

The DOM is generated entirely from `MIDI_TABS` / `AUDIO_TABS`: tab → categories → items. MIDI items carry `pc` (1-based, sent as `pc - 1`), `msb` (CC0) and `lsb` (CC32). Audio items carry `file` and optionally `img`, `start`, `end`, `catClass`. Tab-level options `cols` and `gridType: 'animals'` change the grid layout. The README documents the full config schema.

### FX overlays

`midi-fx-ui.js` and `audio-fx-ui.js` are deliberately parallel implementations with the same function shape (`build…Popup`, `apply…Preset`, `animate…ToValues`, `infer…PresetKey`, `reset…Effects`) and shared styles in `css/style.fx.css`. A change to one usually needs the mirror change in the other.

- Each overlay is driven by a `*_FX_CONTROLS` array. Each control has `key`, `min`/`max`/`step`, `neutral`, `read(settings)`, `apply(value)` and `formatValue`.
- A preset's `values` only lists the controls it changes. Every other control falls back to its `neutral` value, not to the slider's current position. `values: null` is the reset preset.
- The active preset is inferred from the current slider values (`infer…PresetKey`), so the highlight comes back after a tab switch or after the popup is closed and reopened.
- MIDI FX state is whatever the app last sent. It is never read back from the piano. Audio FX state is read from `AudioEngineAPI.getCurrentSettings()`.

### Layout

Button heights are equalized in JS (`equalizeMidiButtons` / `equalizeAudioButtons`, run by a `ResizeObserver`). Portrait mode rearranges the MIDI grids (`rearrangeMidiGrid`). The target device is an ~11" landscape/portrait tablet, so check both orientations.
