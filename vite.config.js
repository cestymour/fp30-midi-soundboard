import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  // Chemins relatifs : le site est servi sous /fp30-midi-soundboard/ sur GitHub Pages
  base: './',
  define: {
    // Version affichée dans la popup « À propos »
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
