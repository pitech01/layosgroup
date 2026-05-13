import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'
import { IncomingMessage, ServerResponse } from 'http'
import tailwindcss from '@tailwindcss/vite'


const pdfProxyPlugin = () => ({
  name: 'pdf-proxy',
  configureServer(server: ViteDevServer) {
    // Custom middleware: /dev-pdf-proxy?url=<encoded-url>
    // Fetches the remote PDF server-side and streams it back to bypass CORS
    server.middlewares.use('/dev-pdf-proxy', (req: IncomingMessage, res: ServerResponse) => {
      const reqUrl = new URL(req.url || '', 'http://localhost');
      const targetUrl = reqUrl.searchParams.get('url');

      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing url parameter' }));
        return;
      }

      try {
        // Ensure the URL is properly parsed. new URL() automatically encodes spaces correctly 
        // without mutating existing encoded characters like %2F (which breaks AWS S3 signatures).
        const parsedTargetUrl = new URL(targetUrl);
        const client = parsedTargetUrl.protocol === 'https:' ? https : http;

        const proxyReq = client.get(parsedTargetUrl, {
          headers: {
            'Referer': 'https://layosgroupllc.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          rejectUnauthorized: false // Allow self-signed certs for local development
        }, (proxyRes) => {
          // If the CDN or backend returns an error (like 404 or 403), pass it along
          if (proxyRes.statusCode && proxyRes.statusCode !== 200) {
            res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Remote server returned ${proxyRes.statusCode}` }));
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300',
          });
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          console.error('[PDF Proxy Error]', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid URL: ' + err.message }));
      }
    });
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pdfProxyPlugin()],
  server: {
    port: 5173, // or your desired port
    host: '127.0.0.1', 
  },
  build: {
    sourcemap: false, // Prevents original source code from being exposed in browser devtools
    chunkSizeWarningLimit: 1000,
  }
})
