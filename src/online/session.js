/**
 * Session token storage and retrieval.
 * Uses sessionStorage — clears on tab close.
 */

const SESSION_KEY = 'mitambo_session';
const PLAYER_KEY = 'mitambo_player';

/**
 * Save session token and player profile.
 */
export function saveSession(sessionToken, player) {
  sessionStorage.setItem(SESSION_KEY, sessionToken);
  sessionStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

/**
 * Get the stored session token.
 */
export function getSessionToken() {
  return sessionStorage.getItem(SESSION_KEY);
}

/**
 * Get the stored player profile.
 */
export function getPlayer() {
  const raw = sessionStorage.getItem(PLAYER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Clear session (logout).
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PLAYER_KEY);
}

/**
 * Check if a session exists.
 */
export function hasSession() {
  return !!sessionStorage.getItem(SESSION_KEY);
}
