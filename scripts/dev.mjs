import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { buildCard } from './build.mjs';

export async function startPreview(port = 4173) {
  const root = resolve(import.meta.dirname, '..');
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    const relative = path === '/' ? 'dev/index.html' : path.slice(1);
    const file = resolve(root, relative);
    if (!file.startsWith(root + '/') || !['dev/index.html', 'dev/fixtures.js', 'dev/ha-selector-stub.js', 'dist/hausklima-card.js'].includes(relative)) {
      response.writeHead(404).end(); return;
    }
    try { response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'text/plain' }).end(await readFile(file)); }
    catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] === import.meta.filename) {
  await buildCard();
  await startPreview(Number(process.env.PORT ?? 4173));
  console.log(`HausKlima preview: http://127.0.0.1:${process.env.PORT ?? 4173}`);
}
