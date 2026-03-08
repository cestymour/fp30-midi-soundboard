# 🎭 FP-30X MIDI Soundboard

Web-based MIDI soundboard designed for live improv theater. One click to select an instrument or sound effect, then play it on the Roland FP-30X piano.

## What it does

- Instantly switch between instruments and sound effects during a live performance
- Organized by cinematic universe (classical, western, medieval, jazz, sci-fi, horror, asian...) and sound category (nature, animals, vehicles, human, SFX...)
- Auto-connects to the Roland FP-30X on page load
- Volume control directly from the interface

## How it works

Click a button → the instrument or sound is selected on the piano → play the keys to produce the sound. No sound is triggered automatically by the app.

## Tech

- Vanilla JavaScript
- Web MIDI API (no dependencies, no framework)
- Single HTML file

## Requirements

- A browser that supports the Web MIDI API (Chrome / Edge recommended)
- A Roland FP-30X connected via USB

## Notes

GM2 sounds will work on any GM2-compatible instrument. Roland-specific sounds (Roland sound banks) are designed for the FP-30X and may not work as expected on other devices.

## License

MIT