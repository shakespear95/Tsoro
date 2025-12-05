import { supabase } from './supabaseClient';

/**
 * Get AI move suggestion using Supabase Edge Function
 * @param {Array} board - Current game board state
 * @param {number} currentPlayer - Current player (1 or 2)
 * @param {number} player1Bank - Player 1's bank hole index
 * @param {number} player2Bank - Player 2's bank hole index
 * @param {string} direction - Direction of play ('clockwise' or 'counterclockwise')
 * @param {number} startingPebbles - Starting pebbles per hole
 * @param {string} difficulty - AI difficulty level ('easy', 'medium', 'hard')
 * @returns {Promise<number>} - The hole index to play
 */
export async function getAIMove(board, currentPlayer, player1Bank, player2Bank, direction, startingPebbles, difficulty = 'medium') {
  try {
    const { data, error } = await supabase.functions.invoke('ai-move', {
      body: {
        board,
        currentPlayer,
        player1Bank,
        player2Bank,
        direction,
        startingPebbles,
        difficulty
      }
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }

    if (data && data.move !== undefined) {
      return data.move;
    } else {
      throw new Error('Invalid response from AI function');
    }
  } catch (error) {
    console.error('Error getting AI move from Supabase:', error);
    // Fallback to simple AI
    return getSimpleAIMove(board, currentPlayer, player1Bank, player2Bank);
  }
}

/**
 * Simple rule-based AI (fallback, no API needed)
 */
export function getSimpleAIMove(board, currentPlayer, player1Bank, player2Bank) {
  const bankHole = currentPlayer === 1 ? player1Bank : player2Bank;
  const playerHoles = currentPlayer === 1
    ? Array.from({length: 8}, (_, i) => i).filter(i => i !== player1Bank && board[i] > 0)
    : Array.from({length: 8}, (_, i) => i + 8).filter(i => i !== player2Bank && board[i] > 0);

  if (playerHoles.length === 0) {
    throw new Error('No valid moves available');
  }

  // Strategy: Prefer moves that might land in bank or create relays
  const scoredMoves = playerHoles.map(hole => {
    const pebbles = board[hole];
    let score = 0;

    // Prefer moves with more pebbles (more likely to create relays)
    score += pebbles;

    // Bonus if move might land in bank (rough estimate)
    const distance = Math.abs(bankHole - hole);
    if (pebbles >= distance) {
      score += 10;
    }

    return { hole, score };
  });

  // Sort by score and pick the best
  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].hole;
}
