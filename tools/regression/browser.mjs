// Lancement de Chromium pour les scripts de non-régression (voir README.md)
const PLAYWRIGHT_CORE = process.env.PLAYWRIGHT_CORE ?? '/tmp/pwtest/node_modules/playwright-core/index.mjs';
const CHROMIUM_PATH   = process.env.CHROMIUM_PATH;

const { chromium } = await import(PLAYWRIGHT_CORE);

export function launchBrowser() {
  return chromium.launch({
    ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {}),
    args: ['--autoplay-policy=no-user-gesture-required'],
  });
}
