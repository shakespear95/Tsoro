/**
 * HTTP route handler.
 * POST /auth/verify, GET /api/profile, GET /api/leaderboard
 */
import { handleAuthVerify, authenticateSession, sendJSON } from '../middleware/auth.js';
import { getPlayerProfile } from '../db/player-repo.js';
import { getLeaderboard, getGameLeaderboard } from '../db/leaderboard-repo.js';

/**
 * Handle an HTTP request. Returns true if handled, false otherwise.
 */
export async function handleRoute(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS headers for API routes
  if (path.startsWith('/auth/') || path.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }
  }

  // POST /auth/verify
  if (path === '/auth/verify' && req.method === 'POST') {
    await handleAuthVerify(req, res);
    return true;
  }

  // GET /api/profile
  if (path === '/api/profile' && req.method === 'GET') {
    const uid = extractUid(req);
    if (!uid) {
      sendJSON(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const profile = getPlayerProfile(uid);
    if (!profile) {
      sendJSON(res, 404, { error: 'Player not found' });
      return true;
    }

    sendJSON(res, 200, { profile });
    return true;
  }

  // GET /api/leaderboard
  if (path === '/api/leaderboard' && req.method === 'GET') {
    const gameType = url.searchParams.get('game');
    const leaderboard = gameType
      ? getGameLeaderboard(gameType)
      : getLeaderboard();

    sendJSON(res, 200, { leaderboard });
    return true;
  }

  return false;
}

function extractUid(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return authenticateSession(token);
}
