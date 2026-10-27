import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/virtue-eval.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env or .env.local if present
try {
  if (fs.existsSync(path.join(__dirname, '.env.local'))) {
    process.loadEnvFile(path.join(__dirname, '.env.local'));
    console.log('✓ Loaded environment variables from .env.local');
  } else if (fs.existsSync(path.join(__dirname, '.env'))) {
    process.loadEnvFile(path.join(__dirname, '.env'));
    console.log('✓ Loaded environment variables from .env');
  } else {
    console.warn('ℹ No .env or .env.local found. Dynamic Virtue Lab AI will need API keys.');
  }
} catch (e) {
  console.warn('Notice loading env file:', e.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API endpoint: /api/virtue-eval
  if (pathname === '/api/virtue-eval' || pathname === '/api/virtue-eval/') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (err) {
        req.body = {};
      }

      // Adapter for Vercel Serverless Function signature
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      };

      try {
        await handler(req, res);
      } catch (err) {
        console.error('Server error handling API request:', err);
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      }
    });
    return;
  }

  // Serve static files
  let safePath = pathname === '/' || pathname === '/index.html'
    ? 'index.html'
    : decodeURIComponent(pathname.replace(/^\/+/, ''));

  let filePath = path.join(__dirname, safePath);

  // Security check: ensure path is within __dirname
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 Not Found</h1><p><a href="/">Go to Homepage</a></p>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  UMak Ethics — Dignity into Action (Group 1)`);
  console.log(`  Dynamic Virtue Lab Server running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  const hasOR = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here');
  const hasGroq = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  console.log(`OpenRouter key: ${hasOR ? '✓ Configured' : '⚠ Missing or default in .env.local'}`);
  console.log(`Groq key:       ${hasGroq ? '✓ Configured' : '⚠ Missing or default in .env.local'}`);
  console.log(`\nTo test the AI, open http://localhost:${PORT} in your browser.`);
});
