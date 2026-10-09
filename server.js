// server.js

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Enable CORS for all local requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Proxy endpoint for Fish Audio API
    if (req.url.startsWith('/api/fish-tts')) {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));
        req.on('end', () => {
            const bodyBuffer = Buffer.concat(bodyChunks);
            const targetUrl = new URL('https://api.fish.audio/v1/tts');
            
            const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
            reqUrl.searchParams.forEach((val, key) => targetUrl.searchParams.set(key, val));

            const proxyReq = https.request(targetUrl, {
                method: 'POST',
                headers: {
                    'Authorization': req.headers['authorization'] || '',
                    'Content-Type': 'application/json',
                    'model': req.headers['model'] || targetUrl.searchParams.get('model') || 's2.1-pro-free'
                }
            }, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
                    'Access-Control-Allow-Origin': '*'
                });
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
                console.error('[Local Server Proxy Error]', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });

            proxyReq.write(bodyBuffer);
            proxyReq.end();
        });
        return;
    }

    // Serve static files
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, reqPath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`[Local AI Starter] Server running at http://localhost:${PORT}`);
});
