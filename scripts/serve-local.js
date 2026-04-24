const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.argv[2] || 8080);
const root = path.resolve(process.argv[3] || process.cwd());

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
};

function sendError(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relativePath = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  let fullPath = path.resolve(root, relativePath);

  if (!fullPath.startsWith(root)) {
    throw new Error('Forbidden path');
  }

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'index.html');
  }

  return fullPath;
}

function streamFile(req, res, filePath, stat) {
  const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');

  if (!range || stat.size === 0) {
    res.writeHead(200, { 'Content-Length': stat.size });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    sendError(res, 416, 'Invalid range');
    return;
  }

  let start;
  let end;

  if (match[1] === '' && match[2] !== '') {
    const suffixLength = Number(match[2]);
    start = Math.max(0, stat.size - suffixLength);
    end = stat.size - 1;
  } else {
    start = Number(match[1] || 0);
    end = match[2] ? Number(match[2]) : stat.size - 1;
  }

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < start ||
    start >= stat.size
  ) {
    res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
    res.end();
    return;
  }

  end = Math.min(end, stat.size - 1);
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Length': chunkSize,
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  fs.createReadStream(filePath, { start, end }).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const filePath = resolveRequestPath(req.url);
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        sendError(res, 404, 'Not found');
        return;
      }
      streamFile(req, res, filePath, stat);
    });
  } catch (err) {
    if (err.message === 'Forbidden path') {
      sendError(res, 403, 'Forbidden');
      return;
    }
    sendError(res, 500, 'Internal server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('');
  console.log('FP30 MIDI Soundboard local server');
  console.log(`Root : ${root}`);
  console.log(`URL  : http://localhost:${port}/`);
  console.log('');
  console.log('Stop the server by closing this window.');
  console.log('');
});
