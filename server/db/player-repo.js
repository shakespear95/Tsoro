/**
 * Player CRUD operations.
 */
import { getDatabase } from '../config/db.js';

/**
 * Insert or update a player. Returns the player row.
 */
export function upsertPlayer({ id, displayName, avatarUrl }) {
  const db = getDatabase();
  const now = Date.now();

  db.prepare(`
    INSERT INTO players (id, display_name, avatar_url, elo, created_at, last_seen)
    VALUES (?, ?, ?, 1200, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      last_seen = excluded.last_seen
  `).run(id, displayName, avatarUrl, now, now);

  return getPlayer(id);
}

/**
 * Get a player by ID.
 */
export function getPlayer(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM players WHERE id = ?').get(id) || null;
}

/**
 * Update player ELO.
 */
export function updatePlayerElo(id, newElo) {
  const db = getDatabase();
  db.prepare('UPDATE players SET elo = ? WHERE id = ?').run(newElo, id);
}

/**
 * Update last_seen timestamp.
 */
export function touchPlayer(id) {
  const db = getDatabase();
  db.prepare('UPDATE players SET last_seen = ? WHERE id = ?').run(Date.now(), id);
}

/**
 * Get or create player_stats row for a player + game type.
 */
export function getPlayerStats(playerId, gameType) {
  const db = getDatabase();
  let stats = db.prepare(
    'SELECT * FROM player_stats WHERE player_id = ? AND game_type = ?'
  ).get(playerId, gameType);

  if (!stats) {
    db.prepare(`
      INSERT INTO player_stats (player_id, game_type, wins, losses, draws, streak, best_streak)
      VALUES (?, ?, 0, 0, 0, 0, 0)
    `).run(playerId, gameType);
    stats = db.prepare(
      'SELECT * FROM player_stats WHERE player_id = ? AND game_type = ?'
    ).get(playerId, gameType);
  }

  return stats;
}

/**
 * Get all stats for a player (all game types).
 */
export function getAllPlayerStats(playerId) {
  const db = getDatabase();
  return db.prepare(
    'SELECT * FROM player_stats WHERE player_id = ?'
  ).all(playerId);
}

/**
 * Get player profile with all stats.
 */
export function getPlayerProfile(playerId) {
  const player = getPlayer(playerId);
  if (!player) return null;

  const stats = getAllPlayerStats(playerId);
  return { ...player, stats };
}
