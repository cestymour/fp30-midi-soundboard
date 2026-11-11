/// <reference types="vite/client" />

/** Version de l'app (champ `version` de package.json), injectée par Vite (voir vite.config.ts) */
declare const __APP_VERSION__: string;

/**
 * Empreinte de chaque son et image (chemin « sounds/x.mp3 » → empreinte), calculée à la build
 * (tools/asset-hashes.ts, voir vite.config.ts) ; vide en dev et dans les tests. Voir src/asset-url.ts
 */
declare const __ASSET_HASHES__: Record<string, string>;
