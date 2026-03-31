import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pdf-proxy',
      configureServer(server: any) {
        // Custom middleware: /dev-pdf-proxy?url=<encoded-url>
        // Fetches the remote PDF server-side and streams it back to bypass CORS
        server.middlewares.use('/dev-pdf-proxy', (req: any, res: any) => {
          const reqUrl = new URL(req.url || '', 'http://localhost');
          const targetUrl = reqUrl.searchParams.get('url');

          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          try {
            const parsed = new URL(targetUrl);
            const client = parsed.protocol === 'https:' ? https : http;

            const proxyReq = client.get(targetUrl, (proxyRes: any) => {
              res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300',
              });
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err: any) => {
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
    }
  ],
})
