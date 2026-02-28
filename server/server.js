/**
 * Mitambo game server entry point.
 * HTTP (static files + API) + WebSocket.
 */
import { createServer } from 'node:http';
import { config } from './config/env.js';
import { initFirebase } from './config/firebase-admin.js';
import { initDatabase } from './config/db.js';
import { serveStatic } from './middleware/static.js';
import { handleRoute } from './routes/http-routes.js';
import { initWebSocket } from './routes/ws-handler.js';
import { logger } from './utils/logger.js';

// Initialize services
initDatabase();

try {
  initFirebase();
} catch (err) {
  logger.warn('Firebase not configured — auth will fail until configured.');
  logger.warn('Set FIREBASE_SERVICE_ACCOUNT in server/.env');
}

// Create HTTP server
const server = createServer(async (req, res) => {
  try {
    // Try API routes first
    const handled = await handleRoute(req, res);
    if (handled) return;

    // Try static files
    const served = await serveStatic(req, res);
    if (served) return;

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    logger.error('Request error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Initialize WebSocket
initWebSocket(server);

// Start listening
server.listen(config.PORT, () => {
  logger.info(`Mitambo server running on http://localhost:${config.PORT}`);
});
