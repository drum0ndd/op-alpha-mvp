import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { TEST_DATABASE_URL, assertTestDatabase } from './test-environment.mjs';
import { terminateTestProcess } from './test-process.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL, TEST_DATABASE_URL,
  NODE_ENV: 'test', OPALPHA_TEST_RUN: '1', CI: '1', PORT: '3334',
  CORS_ORIGIN: 'http://127.0.0.1:8082', EXPO_PUBLIC_API_URL: 'http://127.0.0.1:3334/v1' };
assertTestDatabase(env.DATABASE_URL);
const compose = ['compose', '-p', 'opalpha-tests', '-f', 'infra/docker-compose.test.yml'];
const browserOnly = process.argv.includes('--browser-only');
const databaseOnly = process.argv.includes('--database-only');
if (browserOnly && databaseOnly) throw new Error('Escolha apenas um modo de teste.');
const corepack = process.platform === 'win32' ? 'corepack.cmd' : 'corepack';
let activeChild;
let stopping = false;
async function run(command, args) {
  if (stopping) throw new Error('Execução de testes interrompida.');
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env, stdio: 'inherit', windowsHide: true,
      detached: process.platform !== 'win32', shell: process.platform === 'win32' && command.endsWith('.cmd') });
    activeChild = child;
    child.once('error', error => { if (activeChild === child) activeChild = undefined; reject(error); });
    child.once('exit', code => {
      if (activeChild === child) activeChild = undefined;
      code === 0 ? resolve() : reject(new Error(`${command} terminou com código ${code}`));
    });
  });
}
async function requireFreePort(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error(`Porta de teste ${port} ocupada; nenhum serviço existente será encerrado.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
let ownsContainer = false;
function cleanup() {
  if (ownsContainer) {
    // This exact Compose project has tmpfs storage; the development project is never targeted.
    const result = spawnSync('docker', [...compose, 'down'], { cwd: root, env, stdio: 'inherit' });
    ownsContainer = false;
    if (result.status !== 0) process.exitCode = 1;
  }
}
async function stop(code) {
  if (stopping) return;
  stopping = true;
  try { await terminateTestProcess(activeChild); }
  catch (error) { console.error(error.message); }
  finally { cleanup(); process.exit(code); }
}
process.once('SIGINT', () => { void stop(130); });
process.once('SIGTERM', () => { void stop(143); });
try {
  for (const port of databaseOnly ? [5433] : [5433, 3334, 8082]) await requireFreePort(port);
  const existing = spawnSync('docker', [...compose, 'ps', '-a', '-q'], { cwd: root, env, encoding: 'utf8' });
  if (existing.status !== 0) throw new Error('Docker indisponível. Abra o Docker Desktop antes dos testes.');
  if (existing.stdout.trim()) throw new Error('Já existe um ambiente opalpha-tests. Revise e encerre esse ambiente antes de repetir.');
  await run(process.execPath, ['--test', 'scripts/test-process.test.mjs']);
  ownsContainer = true;
  await run('docker', [...compose, 'up', '-d', '--wait']);
  await run(corepack, ['pnpm', '--filter', '@op-alpha/contracts', 'build']);
  await run(corepack, ['pnpm', '--filter', '@op-alpha/api', 'prisma:generate']);
  await run(corepack, ['pnpm', '--filter', '@op-alpha/api', 'prisma:deploy']);
  await run(corepack, ['pnpm', '--filter', '@op-alpha/api', 'exec', 'nest', 'build']);
  await run(process.execPath, ['apps/api/test/seed-e2e.mjs']);
  if (!browserOnly) await run(corepack, ['pnpm', '--filter', '@op-alpha/api', 'exec', 'vitest', 'run', 'test/users.database.test.ts', 'test/catalog.database.test.ts']);
  if (!databaseOnly) {
    await run(corepack, ['pnpm', '--filter', '@op-alpha/mobile', 'exec', 'expo', 'export', '--platform', 'web', '--output-dir', 'dist-test']);
    await run(corepack, ['pnpm', 'exec', 'playwright', 'test', '--config', 'apps/mobile/playwright.config.mjs']);
  }
} catch (error) {
  if (!stopping) { console.error(error.message); process.exitCode = 1; }
} finally { if (!stopping) cleanup(); }
