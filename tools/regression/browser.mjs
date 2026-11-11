// Lancement de Chromium pour les scripts de non-régression (voir README.md)
// Par défaut le Chrome installé sur la machine ; CHROMIUM_PATH donne un autre exécutable
// (par exemple le Chromium 106 de la tablette de scène), REGRESSION_CHANNEL un autre canal (msedge).
import { chromium } from 'playwright-core';

const CHROMIUM_PATH = process.env.CHROMIUM_PATH;
const CHANNEL       = process.env.REGRESSION_CHANNEL ?? 'chrome';

export function launchBrowser() {
  return chromium.launch({
    ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : { channel: CHANNEL }),
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu'],
  });
}
