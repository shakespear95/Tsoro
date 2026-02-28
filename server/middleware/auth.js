/**
 * Authentication middleware.
 * Verify Firebase ID tokens and issue/verify session tokens.
 */
import { verifyIdToken } from '../config/firebase-admin.js';
import { createSessionToken, verifySessionToken } from '../utils/session-token.js';
import { upsertPlayer } from '../db/player-repo.js';
import { logger } from '../utils/logger.js';

/**
 * Handle POST /auth/verify
 * Body: { idToken: string }
 * Response: { sessionToken, player }
 */
export async function handleAuthVerify(req, res) {
  try {
    const body = await readBody(req);
    const { idToken } = JSON.parse(body);

    if (!idToken) {
      sendJSON(res, 400, { error: 'Missing idToken' });
      return;
    }

    const decoded = await verifyIdToken(idToken);
    const { uid, name, picture } = decoded;

    // Upsert player in database
    const player = upsertPlayer({
      id: uid,
      displayName: name || 'Player',
      avatarUrl: picture || null,
    });

    // Create session token
    const sessionToken = createSessionToken(uid);

    logger.info(`Auth: ${player.display_name} (${uid})`);

    sendJSON(res, 200, { sessionToken, player });
  } catch (err) {
    logger.error('Auth verify failed:', err.message);
    sendJSON(res, 401, { error: 'Invalid token' });
  }
}

/**
 * Authenticate a session token string.
 * Returns uid or null.
 */
export function authenticateSession(token) {
  return verifySessionToken(token);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}
