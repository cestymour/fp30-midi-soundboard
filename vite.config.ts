import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  // Chemins relatifs : le site est servi sous /fp30-midi-soundboard/ sur GitHub Pages
  base: './',
  define: {
    // Version affichée dans la popup « À propos »
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    svelte(),
    VitePWA({
      // Service Worker maison (src/sw.ts), publié sous le nom sw.js à la racine du site
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // Enregistrement fait à la main dans src/main.ts
      injectRegister: false,
      // Manifest web : on garde public/manifest.json tel quel
      manifest: false,
      injectManifest: {
        rollupFormat: 'iife',
        // Fichiers app à précacher ; sons et images sont mis en cache au premier accès
        globPatterns: ['**/*.{html,js,css,ico,png,json}'],
        globIgnores: ['sounds/**', 'images/**'],
      },
    }),
  ],
});
