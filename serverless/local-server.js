const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const { handler } = require('./index');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  console.log(`[Local Serverless] ${req.method} ${req.url}`);

  // Manejo de CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    });
    return res.end();
  }

  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'UP', service: 'serverless-local-lambda' }));
  }

  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', async () => {
    const rawBody = Buffer.concat(bodyChunks).toString();
    const event = {
      httpMethod: req.method,
      path: req.url,
      body: rawBody,
      headers: req.headers,
    };

    try {
      const result = await handler(event);
      const headers = result.headers || { 'Content-Type': 'application/json' };
      res.writeHead(result.statusCode || 200, headers);
      res.end(result.body);
    } catch (err) {
      console.error('[Local Serverless Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Local Serverless] Servidor local Serverless Lambda escuchando en http://localhost:${PORT}`);
  console.log(`[Local Serverless] Endpoint POST listo en http://localhost:${PORT}/send-email`);
});
