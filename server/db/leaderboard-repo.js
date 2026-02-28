/**
 * Leaderboard queries.
 */
import { getDatabase } from '../config/db.js';

/**
 * Get the top players by ELO.
 */
export function getLeaderboard(limit = 20) {
  const db = getDatabase();
  return db.prepare(`
    SELECT p.id, p.display_name, p.avatar_url, p.elo,
      COALESCE(SUM(s.wins), 0) as total_wins,
      COALESCE(SUM(s.losses), 0) as total_losses,
      COALESCE(SUM(s.draws), 0) as total_draws
    FROM players p
    LEFT JOIN player_stats s ON p.id = s.player_id
    GROUP BY p.id
    ORDER BY p.elo DESC
    LIMIT ?
  `).all(limit);
}

/**
 * Get leaderboard for a specific game type.
 */
export function getGameLeaderboard(gameType, limit = 20) {
  const db = getDatabase();
  return db.prepare(`
    SELECT p.id, p.display_name, p.avatar_url, p.elo,
      s.wins, s.losses, s.draws, s.streak, s.best_streak
    FROM players p
    INNER JOIN player_stats s ON p.id = s.player_id
    WHERE s.game_type = ?
    ORDER BY s.wins DESC
    LIMIT ?
  `).all(gameType, limit);
}
