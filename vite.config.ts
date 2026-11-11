import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { colorMixCompat } from './tools/color-mix-compat.ts';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  // Chemins relatifs : le site est servi sous /fp30-midi-soundboard/ sur GitHub Pages
  base: './',
  build: {
    // Tablette de scène en Chrome 106 : sans cette cible, Vite 8 vise des navigateurs plus récents
    // (Chrome 107 et plus). On garde l'ancienne cible par défaut de Vite (« modules », jusqu'à
    // Vite 6), plus large, pour le JS et le CSS. Le Service Worker (vite-plugin-pwa) la reprend.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Minification CSS par esbuild, comme avec Vite 6 : Lightning CSS (défaut de Vite 8) réécrit
    // media queries, dégradés et raccourcis, et Chrome 106 n'en donne pas exactement le même rendu
    cssMinify: 'esbuild',
  },
  define: {
    // Version affichée dans la popup « À propos »
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  css: {
    postcss: {
      // color-mix() réécrit en rgb() / rgba() : la tablette de scène est en Chrome 106
      // (color-mix() depuis Chrome 111). Voir tools/color-mix-compat.ts
      plugins: [colorMixCompat()],
    },
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
        // Fichiers app à précacher, polices comprises (woff2 seulement : Chrome n'utilise pas
        // le repli woff) ; sons et images sont mis en cache au premier accès
        globPatterns: ['**/*.{html,js,css,ico,png,json,woff2}'],
        globIgnores: ['sounds/**', 'images/**'],
      },
    }),
  ],
});
