import { defineConfig, type Connect, type PreviewServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_WIZARD_ENVELOPE } from './src/wizardState';

function wizardStatePlugin() {
  let sharedEnvelope = DEFAULT_WIZARD_ENVELOPE;

  const handler: Connect.NextHandleFunction = (request, response, next) => {
    if (!request.url?.startsWith('/__woz_state')) {
      next();
      return;
    }

    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'no-store');

    if (request.method === 'GET') {
      response.end(JSON.stringify(sharedEnvelope));
      return;
    }

    if (request.method === 'POST') {
      let body = '';

      request.on('data', (chunk) => {
        body += chunk;
      });

      request.on('end', () => {
        try {
          sharedEnvelope = JSON.parse(body);
          response.end(JSON.stringify(sharedEnvelope));
        } catch {
          response.statusCode = 400;
          response.end(JSON.stringify({ error: 'Invalid wizard state payload' }));
        }
      });

      return;
    }

    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed' }));
  };

  const attachMiddleware = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(handler);
  };

  return {
    name: 'wizard-state-plugin',
    configureServer(server: ViteDevServer) {
      attachMiddleware(server);
    },
    configurePreviewServer(server: PreviewServer) {
      attachMiddleware(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), wizardStatePlugin()],
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});
