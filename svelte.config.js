import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // TypeScript dans les composants (<script lang="ts">)
  preprocess: vitePreprocess(),
};
