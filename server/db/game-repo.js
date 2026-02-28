/**
 * Game history storage and ELO calculation.
 */
import { randomUUID } from 'node:crypto';
import { getDatabase } from '../config/db.js';
import { getPlayer, updatePlayerElo, getPlayerStats } from './player-repo.js';

const K_NORMAL = 32;
const K_FORFEIT = 16;

/**
 * Calculate expected score using ELO formula.
 */
function expectedScore(myElo, oppElo) {
  return 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
}

/**
 * Calculate new ELO after a game result.
 * actual: 1 = win, 0.5 = draw, 0 = loss
 */
function calcNewElo(currentElo, oppElo, actual, isForfeit) {
  const k = isForfeit ? K_FORFEIT : K_NORMAL;
  const expected = expectedScore(currentElo, oppElo);
  return Math.round(currentElo + k * (actual - expected));
}

/**
 * Record a completed game result and update ELO + stats.
 *
 * @param {object} params
 * @param {string} params.gameType - 'damii', 'tsoro', 'crazy8'
 * @param {string} params.player1Id - Firebase UID
 * @param {string} params.player2Id - Firebase UID
 * @param {string|null} params.winnerId - Firebase UID or null for draw
 * @param {boolean} params.forfeit - Whether the loser forfeited
 * @param {number} params.durationS - Game duration in seconds
 * @param {number} params.moveCount - Total moves made
 * @returns {object} The saved game record
 */
export function recordGame({ gameType, player1Id, player2Id, winnerId, forfeit, durationS, moveCount }) {
  const db = getDatabase();

  const p1 = getPlayer(player1Id);
  const p2 = getPlayer(player2Id);

  if (!p1 || !p2) throw new Error('Player not found');

  // Calculate ELO deltas
  let actual1, actual2;
  if (winnerId === null) {
    actual1 = 0.5;
    actual2 = 0.5;
  } else if (winnerId === player1Id) {
    actual1 = 1;
    actual2 = 0;
  } else {
    actual1 = 0;
    actual2 = 1;
  }

  const newElo1 = calcNewElo(p1.elo, p2.elo, actual1, forfeit && winnerId !== player1Id);
  const newElo2 = calcNewElo(p2.elo, p1.elo, actual2, forfeit && winnerId !== player2Id);
  const delta1 = newElo1 - p1.elo;
  const delta2 = newElo2 - p2.elo;

  const gameId = randomUUID();
  const now = Date.now();

  // Use a transaction for atomicity
  const saveGame = db.transaction(() => {
    // Save game record
    db.prepare(`
      INSERT INTO games (id, game_type, player1_id, player2_id, winner_id, forfeit, duration_s, move_count, elo_delta_p1, elo_delta_p2, played_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(gameId, gameType, player1Id, player2Id, winnerId, forfeit ? 1 : 0, durationS, moveCount, delta1, delta2, now);

    // Update ELOs
    updatePlayerElo(player1Id, newElo1);
    updatePlayerElo(player2Id, newElo2);

    // Update stats for both players
    updateStats(player1Id, gameType, actual1);
    updateStats(player2Id, gameType, actual2);
  });

  saveGame();

  return {
    id: gameId,
    gameType,
    player1Id,
    player2Id,
    winnerId,
    forfeit,
    durationS,
    moveCount,
    eloDelta: { [player1Id]: delta1, [player2Id]: delta2 },
    newElo: { [player1Id]: newElo1, [player2Id]: newElo2 },
  };
}

function updateStats(playerId, gameType, actual) {
  const db = getDatabase();

  // Ensure row exists
  getPlayerStats(playerId, gameType);

  if (actual === 1) {
    db.prepare(`
      UPDATE player_stats
      SET wins = wins + 1,
          streak = CASE WHEN streak >= 0 THEN streak + 1 ELSE 1 END,
          best_streak = MAX(best_streak, CASE WHEN streak >= 0 THEN streak + 1 ELSE 1 END)
      WHERE player_id = ? AND game_type = ?
    `).run(playerId, gameType);
  } else if (actual === 0) {
    db.prepare(`
      UPDATE player_stats
      SET losses = losses + 1,
          streak = CASE WHEN streak <= 0 THEN streak - 1 ELSE -1 END
      WHERE player_id = ? AND game_type = ?
    `).run(playerId, gameType);
  } else {
    db.prepare(`
      UPDATE player_stats
      SET draws = draws + 1, streak = 0
      WHERE player_id = ? AND game_type = ?
    `).run(playerId, gameType);
  }
}

/**
 * Get recent games for a player.
 */
export function getRecentGames(playerId, limit = 10) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM games
    WHERE player1_id = ? OR player2_id = ?
    ORDER BY played_at DESC
    LIMIT ?
  `).all(playerId, playerId, limit);
}
