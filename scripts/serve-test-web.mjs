import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertTestDatabase } from './test-environment.mjs';
assertTestDatabase(process.env.DATABASE_URL);
if (process.env.OPALPHA_TEST_RUN !== '1') throw new Error('Use o runner test:app.');
const root = fileURLToPath(new URL('../apps/mobile/dist-test/', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname.split('/').some(part => part.startsWith('.') && part !== '')) { res.writeHead(404).end(); return; }
    let target = path.resolve(root, '.' + pathname);
    if (target !== path.resolve(root) && !target.startsWith(root)) { res.writeHead(404).end(); return; }
    try { if (!(await stat(target)).isFile()) target = path.join(root, 'index.html'); }
    catch { if (path.extname(pathname)) { res.writeHead(404).end(); return; } target = path.join(root, 'index.html'); }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404).end(); }
}).listen(8082, '127.0.0.1', () => console.log('Web de teste em 127.0.0.1:8082'));
