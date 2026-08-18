const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Se não tem extensão, tenta /index.html dentro da pasta
  const ext = path.extname(filePath);
  const target = ext ? filePath : path.join(filePath, 'index.html');

  fs.readFile(target, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 — Arquivo não encontrado: ' + urlPath);
      return;
    }
    const mime = MIME[path.extname(target)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`\n✦ Prism rodando em http://localhost:${PORT}\n`);
  console.log('  Sites disponíveis:');
  console.log(`  → Prism (vitrine)   http://localhost:${PORT}/`);
  console.log(`  → NOIR (moda)       http://localhost:${PORT}/fashion/`);
  console.log(`  → APEX (academia)   http://localhost:${PORT}/gym/`);
  console.log(`  → Terra (rest.)     http://localhost:${PORT}/restaurante/`);
  console.log(`  → ClareDent (odont) http://localhost:${PORT}/odontologia/`);
  console.log('\n  Pressione Ctrl+C para encerrar.\n');
});
