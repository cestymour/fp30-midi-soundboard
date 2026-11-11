// Outils partagés par run.mjs et run-styles.mjs : lancement des scripts, serveurs statiques, nettoyage
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOLS = path.dirname(fileURLToPath(import.meta.url));
export const REPO  = path.resolve(TOOLS, '../..');

/** Dossier temporaire sous son nom long (Windows le donne parfois en 8.3, CESTYM~1, ce que Vite refuse) */
export const TMP = fs.realpathSync.native(os.tmpdir());

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export function requireDist() {
  if (!fs.existsSync(path.join(REPO, 'dist/index.html'))) fail("dist/ absent : lancer npm run build d'abord");
}

/** Dossier de travail vidé puis recréé */
export function freshDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

/** Copie une build sous <racine>/fp30-midi-soundboard/, le sous-chemin de GitHub Pages */
export function copyBuild(from, root) {
  fs.cpSync(from, path.join(root, 'fp30-midi-soundboard'), { recursive: true });
}

/** Lance un script de tools/regression ; sa sortie standard va dans `outFile` s'il est donné */
export function runScript(script, args, outFile) {
  const out = outFile ? fs.openSync(outFile, 'w') : 'inherit';
  const res = spawnSync(process.execPath, [path.join(TOOLS, script), ...args], { stdio: ['ignore', out, 'inherit'] });
  if (outFile) fs.closeSync(out);
  if (res.status !== 0) fail(`${script} a échoué (code ${res.status})`);
}

/** Lance un script de comparaison : un code de sortie non nul signale des écarts, sans arrêter la suite */
export function compare(script, args) {
  const res = spawnSync(process.execPath, [path.join(TOOLS, script), ...args], { stdio: 'inherit' });
  if (res.status !== 0) process.exitCode = 1;
}

/** Commande externe (git) */
export function exec(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  return res.status === 0;
}

/** npm, lancé par le Node courant : sous Windows, npm.cmd ne se lance pas sans shell */
export function npm(args, options = {}) {
  const cli = process.env.npm_execpath;
  if (!cli) fail('lancer par npm : npm run regression');
  return exec(process.execPath, [cli, ...args], options);
}

const children = [];

/** Serveur statique (server.mjs) sur `port`, arrêté à la sortie ; échoue si le port est déjà pris */
export function serve(root, port) {
  const child = spawn(process.execPath, [path.join(TOOLS, 'server.mjs'), root, String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  return new Promise(resolve => {
    child.stdout.once('data', resolve);
    child.once('exit', () => fail(`serveur impossible à lancer sur le port ${port} (déjà pris ?)`));
  });
}

const cleanups = [];
export function onExit(fn) { cleanups.push(fn); }

function cleanup() {
  for (const child of children.splice(0)) { child.removeAllListeners('exit'); child.kill(); }
  for (const fn of cleanups.splice(0)) { try { fn(); } catch { /* nettoyage au mieux */ } }
}
process.on('exit', cleanup);

/** Fin du script : arrête les serveurs (sinon ils gardent Node en vie) et rend le code de sortie */
export function finish() {
  cleanup();
  process.exit(process.exitCode ?? 0);
}
process.on('SIGINT', () => { cleanup(); process.exit(130); });
