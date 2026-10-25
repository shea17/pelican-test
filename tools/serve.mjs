import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const ROOT = resolve(HERE, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.md': 'text/markdown; charset=utf-8',
};

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let path = decodeURIComponent(url.pathname);
      if (path === '/') path = '/public/index.html';
      const abs = normalize(join(ROOT, path));
      if (!abs.startsWith(ROOT)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      const s = await stat(abs).catch(() => null);
      if (!s || !s.isFile()) {
        res.writeHead(404, NO_CACHE).end('not found: ' + path);
        return;
      }
      const buf = await readFile(abs);
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': MIME[extname(abs).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    } catch (e) {
      res.writeHead(500).end(String(e && e.stack || e));
    }
  });
  return new Promise((ok) => {
    server.listen(port, '127.0.0.1', () => ok({ server, port: server.address().port }));
  });
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('serve.mjs')) {
  const { port } = await startServer(Number(process.env.PORT || 5173));
  console.log(`serving ${ROOT} → http://127.0.0.1:${port}/`);
}
